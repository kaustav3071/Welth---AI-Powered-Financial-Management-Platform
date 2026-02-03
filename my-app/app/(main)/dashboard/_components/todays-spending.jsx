"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, Calendar } from "lucide-react";
import { defaultCategories } from "@/data/categories";

export default function TodaysSpending({ transactions = [] }) {
  // Get today's date with proper timezone handling
  const today = new Date();
  
  // Create a more robust date comparison function
  const isToday = (transactionDate) => {
    const transDate = new Date(transactionDate);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Also try timezone-aware comparison using local date strings
    const transDateString = transDate.toLocaleDateString();
    const todayString = today.toLocaleDateString();
    
    return transDate >= todayStart && transDate < todayEnd || transDateString === todayString;
  };

  // Filter today's expense transactions with improved logic
  const todaysExpenses = transactions.filter(transaction => {
    return isToday(transaction.date) && 
           transaction.type === 'EXPENSE' &&
           !transaction.excludeFromBudget;
  });

  // Helper function to get category name from category ID
  const getCategoryName = (categoryId) => {
    const category = defaultCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId; // Fallback to the ID if not found
  };

  // Calculate total spending for today
  const totalSpent = todaysExpenses.reduce((sum, transaction) => sum + transaction.amount, 0);

  // Get today's date in a readable format
  const todayFormatted = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });



  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today's Spending</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {todayFormatted}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Total Spending */}
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-1">
              ₨ {totalSpent.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">
              {todaysExpenses.length === 0 
                ? "No expenses today" 
                : `${todaysExpenses.length} transaction${todaysExpenses.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>

          {/* Recent Transactions */}
          {todaysExpenses.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Expenses</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {todaysExpenses.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description || 'Expense'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getCategoryName(transaction.category)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">
                        -₨ {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                {todaysExpenses.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{todaysExpenses.length - 5} more transactions
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {todaysExpenses.length === 0 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No expenses recorded today</p>
              <p className="text-gray-400 text-xs mt-1">Great job on managing your spending!</p>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-blue-500 mt-2">
                  Debug: Check console for transaction details
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
