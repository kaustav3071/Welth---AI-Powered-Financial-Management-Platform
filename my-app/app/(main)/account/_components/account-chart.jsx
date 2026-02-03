"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

export function AccountChart({ transactions, totalIncome, totalExpenses, accountId }) {
  const [dateRange, setDateRange] = useState("1M");
  const [dbTotals, setDbTotals] = useState({ income: 0, expense: 0, netAmount: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch database stats for the selected date range
  useEffect(() => {
    const fetchDbStats = async () => {
      if (!accountId) return;
      
      setLoading(true);
      try {
        const range = DATE_RANGES[dateRange];
        const now = new Date();
        const startDate = range.days
          ? startOfDay(subDays(now, range.days))
          : startOfDay(new Date(0));
        const endDate = endOfDay(now);

        const response = await fetch(
          `/api/account/${accountId}/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        const data = await response.json();
        
        if (data.error) {
          console.error('Error fetching stats:', data.error);
          return;
        }

        setDbTotals({
          income: data.totalIncome,
          expense: data.totalExpenses,
          netAmount: data.netAmount,
        });
      } catch (error) {
        console.error('Error fetching database stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDbStats();
  }, [dateRange, accountId]);

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Filter transactions within date range
    const filtered = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    // Group transactions by date
    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  // Always use database totals for accuracy
  const totals = useMemo(() => {
    return {
      income: dbTotals.income,
      expense: dbTotals.expense,
    };
  }, [dbTotals]);

  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="text-xl font-bold text-gray-900 mb-1">
            Transaction Overview
          </CardTitle>
          <p className="text-sm text-gray-600">
            Track your income and expenses over time
          </p>
        </div>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px] h-10 bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-lg">
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key} className="hover:bg-gray-100 text-gray-900">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-700 mb-1">Total Income</p>
            <p className="text-xl font-bold text-green-600">
              ₨{totals.income.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-700 mb-1">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">
              ₨{totals.expense.toFixed(2)}
            </p>
          </div>
          <div className={`text-center p-4 rounded-lg border ${
            totals.income - totals.expense >= 0
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            <p className={`text-sm font-medium mb-1 ${
              totals.income - totals.expense >= 0
                ? "text-green-700"
                : "text-red-700"
            }`}>Net Amount</p>
            <p
              className={`text-xl font-bold ${
                totals.income - totals.expense >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              ₨{(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₨${value}`}
              />
              <Tooltip
                formatter={(value) => [`₨${value}`, undefined]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
export default AccountChart; 
