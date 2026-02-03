"use client";

import { useState, useEffect } from 'react';
import AccountChart from './account-chart';
import { Card } from '@/components/ui/card';
import { BarLoader } from 'react-spinners';

export default function AccountChartClient({ accountId, totalIncome, totalExpenses }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch recent transactions for chart data (optimized)
        const response = await fetch(`/api/account/${accountId}/transactions?limit=100`);
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('Error fetching transactions for chart:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accountId]);

  if (loading) {
    return (
      <Card className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return <AccountChart transactions={transactions} totalIncome={totalIncome} totalExpenses={totalExpenses} accountId={accountId} />;
}
