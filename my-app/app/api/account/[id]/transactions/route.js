import { getAccountWithTransactions } from '@/actions/account';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const accountData = await getAccountWithTransactions(params.id, limit, offset);
    
    if (!accountData) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({
      transactions: accountData.transactions,
      account: {
        id: accountData.id,
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance,
        minimumBalance: accountData.minimumBalance,
        monthlyBudget: accountData.monthlyBudget,
        _count: accountData._count
      }
    });
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
