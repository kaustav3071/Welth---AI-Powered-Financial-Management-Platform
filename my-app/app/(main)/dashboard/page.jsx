import { getDashboardData, getUserAccounts, getCurrentUser } from '@/actions/dashboard';
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import React, { Suspense } from 'react'
import AccountCard from './_components/account-card';
import { getCurrentBudget } from '@/actions/budget';
import BudgetProgress from '../account/_components/budget-progress';
import DashboardOverview from './_components/transaction-overview';
import DashboardHeaderWrapper from './_components/dashboard-header-wrapper';
import TodaysSpending from './_components/todays-spending';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

async function DashboardPage()  {
  const user = await getCurrentUser();
  const accounts = await getUserAccounts();
  const transactions = await getDashboardData();

  const defaultAccount = accounts?.find((account => account.isDefault));
  // Get universal budget data (includes all accounts)
  const budgetData = await getCurrentBudget();
  
  return (
    <div className='space-y-8'>
        {/* Dashboard Header with Welcome and Quick Stats */}
        <DashboardHeaderWrapper 
          user={user} 
          accounts={accounts} 
          transactions={transactions}
          defaultAccount={defaultAccount}
        />

        {/* Budget Progress */}
        <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

        {/* Today's Spending */}
        <TodaysSpending transactions={transactions || []} />

        {/* Transaction Overview */}
      <Suspense fallback={
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      }>
        <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />
      </Suspense>

        {/* Accounts Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Accounts</h2>
            <p className="text-gray-600">{accounts?.length || 0} account{accounts?.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <CreateAccountDrawer>
              <Card className='hover:shadow-xl transition-all duration-300 cursor-pointer border-dashed border-2 border-gray-300 hover:border-blue-500 group bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 h-full'>
                <CardContent className='flex flex-col items-center justify-center text-gray-500 group-hover:text-blue-600 h-full p-8 transition-colors duration-300'>
                  <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                    <Plus className='h-8 w-8 text-white'/>
                  </div>
                  <h3 className='text-lg font-semibold mb-2 group-hover:text-blue-600'>Add New Account</h3>
                  <p className='text-sm text-center text-gray-600 group-hover:text-blue-500'>Create a new account to manage your finances</p>
                </CardContent>
              </Card>
            </CreateAccountDrawer>

            {accounts.length > 0 &&
            accounts?.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
        
    </div> 
  )
}

export default DashboardPage;
