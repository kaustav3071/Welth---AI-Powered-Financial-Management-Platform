import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/user-helper';

export async function GET(request, { params }) {
  try {
    const user = await getAuthenticatedUser();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause for date filtering
    const whereClause = {
      accountId: params.id,
    };

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get aggregated transaction data for the specified date range
    const [incomeStats, expenseStats] = await Promise.all([
      db.transaction.aggregate({
        where: {
          ...whereClause,
          type: 'INCOME',
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        }
      }),
      db.transaction.aggregate({
        where: {
          ...whereClause,
          type: 'EXPENSE',
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        }
      })
    ]);

    const totalIncome = incomeStats._sum.amount?.toNumber() || 0;
    const totalExpenses = expenseStats._sum.amount?.toNumber() || 0;
    const netAmount = totalIncome - totalExpenses;

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netAmount,
      incomeCount: incomeStats._count.id || 0,
      expenseCount: expenseStats._count.id || 0,
    });
  } catch (error) {
    console.error('Error fetching account stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
