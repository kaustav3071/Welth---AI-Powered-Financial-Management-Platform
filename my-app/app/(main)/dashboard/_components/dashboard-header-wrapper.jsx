import DashboardHeaderClient from './dashboard-header-client';

export default function DashboardHeaderWrapper({ user, accounts, transactions, defaultAccount }) {
  return (
    <DashboardHeaderClient 
      user={user} 
      accounts={accounts} 
      transactions={transactions}
      defaultAccount={defaultAccount}
    />
  );
}
