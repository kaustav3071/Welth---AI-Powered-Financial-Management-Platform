import { getAccountStats, getAccountWithTransactions } from '@/actions/account';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import TransactionTable from '../_components/transaction-table';
import { BarLoader } from 'react-spinners';
import AccountChart from '../_components/account-chart';
import AccountPageClient from '../_components/account-page-client';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

const AccountPage = async ({params}) => {
  // Get account stats first (fast)
  const accountStats = await getAccountStats(params.id);
  if(!accountStats){
    notFound();
  }

  const {stats, ...account} = accountStats;
  const {totalIncome, totalExpenses} = stats;
  const netAmount = totalIncome - totalExpenses;

  return (
    <AccountPageClient 
      account={account} 
      stats={stats} 
      accountId={params.id}
    />
  );
}

// Wrapper components for lazy loading - these are server components
export async function AccountChartWrapper({ accountId }) {
  const accountData = await getAccountWithTransactions(accountId, 100); // Load only recent 100 transactions for chart
  return <AccountChart transactions={accountData.transactions} />;
}

export async function TransactionTableWrapper({ accountId }) {
  const accountData = await getAccountWithTransactions(accountId, 50); // Load only 50 transactions initially
  return <TransactionTable transactions={accountData.transactions} />;
}

export default AccountPage;
