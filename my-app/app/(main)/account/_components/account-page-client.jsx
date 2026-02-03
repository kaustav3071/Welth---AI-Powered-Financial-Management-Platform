"use client";

import React, { Suspense, useState, useEffect } from 'react';
import TransactionTableClient from './transaction-table-client';
import AccountChartClient from './account-chart-client';
import EditAccountModal from './edit-account-modal';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function AccountPageClient({ account, stats, accountId }) {
  const {totalIncome, totalExpenses} = stats;
  const netAmount = totalIncome - totalExpenses;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Get account icon and gradient based on type
  const getAccountIcon = (type) => {
    switch(type) {
      case 'SAVINGS': return '💰';
      case 'CURRENT': return '💳';
      default: return '🏦';
    }
  };

  return (
    <div className='space-y-8'>
      {/* Header with Back Button */}
      <div className='flex items-center gap-4'>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Account Header Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl`}>
                {getAccountIcon(account.type)}
              </div>
              <div>
                <h1 className='text-4xl font-bold capitalize mb-2'>{account.name}</h1>
                <p className='text-blue-100 text-lg capitalize'>{account.type.toLowerCase()} Account</p>
                <p className='text-blue-200 text-sm'>
                  {account._count.transactions} transaction{account._count.transactions !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right">
              {/* Edit Button at Top */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Account
                </Button>
              </div>
              
              {/* Current Balance */}
              <div className="mb-4">
                <p className="text-blue-100 text-sm mb-2">Current Balance</p>
                <p className="text-4xl font-bold">₨ {parseFloat(account.balance).toFixed(2)}</p>
              </div>
              
              {/* Account Details */}
              <div className="space-y-1">
                {account.minimumBalance && (
                  <p className="text-blue-200 text-xs">
                    Min. to maintain: ₨ {parseFloat(account.minimumBalance).toFixed(2)}
                  </p>
                )}
                {account.monthlyBudget && (
                  <p className="text-blue-200 text-xs">
                    Monthly budget: ₨ {parseFloat(account.monthlyBudget).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards - All Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Income (All Time)</p>
                <p className="text-2xl font-bold text-green-600">₨ {totalIncome.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Expenses (All Time)</p>
                <p className="text-2xl font-bold text-red-600">₨ {totalExpenses.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Net Amount (All Time)</p>
                <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₨ {netAmount.toFixed(2)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                netAmount >= 0
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <AccountChartClient accountId={accountId} totalIncome={totalIncome} totalExpenses={totalExpenses} />

      {/* Transaction Table */}
      <TransactionTableClient accountId={accountId} />  

      {/* Edit Account Modal */}
      <EditAccountModal
        account={account}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
