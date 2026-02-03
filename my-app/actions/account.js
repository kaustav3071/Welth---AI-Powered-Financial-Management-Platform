"use server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/user-helper";

const serializeTransaction = (obj) => {
    const serialized = {...obj};
    if(obj.balance){
        serialized.balance = obj.balance.toNumber();     
    }
    if(obj.minimumBalance){
        serialized.minimumBalance = obj.minimumBalance.toNumber();
    }
    if(obj.monthlyBudget){
        serialized.monthlyBudget = obj.monthlyBudget.toNumber();
    }
    if(obj.amount){
        serialized.amount = obj.amount.toNumber();
    }

    return serialized;
};

export async function updateDefaultAccount(accountId){
    try {
        const user = await getAuthenticatedUser();


        
        await db.account.updateMany({
            where: {
                userId: user.id,
                isDefault: true,
            },
            data: {
                isDefault: false,
            },
        });

        const account = await db.account.update({
            where: {
                id: accountId,
                userId: user.id,
            },
            data: {
                isDefault: true,
            },
        });

        revalidatePath('/dashboard');
        return {success:true,data: serializeTransaction(account)};
        
    } catch (error) {
        return {success:false,error: error.message};
    }
}

export async function getAccountStats(accountId){
    try {
        const user = await getAuthenticatedUser();
                
    const account = await db.account.findUnique({
        where: {
            id: accountId,
            userId: user.id,
        },
        include:{
            _count:{
                    select: {
                        transactions: true,
                    }
                },
        }
    });

    if(!account){
        return null;
    }

    // Get aggregated transaction data
    const [incomeStats, expenseStats] = await Promise.all([
        db.transaction.aggregate({
            where: {
                accountId: accountId,
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
                accountId: accountId,
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

    return {
        ...serializeTransaction(account),
        stats: {
            totalIncome: incomeStats._sum.amount?.toNumber() || 0,
            totalExpenses: expenseStats._sum.amount?.toNumber() || 0,
            incomeCount: incomeStats._count.id || 0,
            expenseCount: expenseStats._count.id || 0,
        }
    };
    } catch (error) {
        throw new Error(`Failed to get account stats: ${error.message}`);
    }
}

export async function getAccountWithTransactions(accountId, limit = 50, offset = 0){
    try {
        const user = await getAuthenticatedUser();
                
    const account = await db.account.findUnique({
        where: {
            id: accountId,
            userId: user.id,
        },
        include:{
            transactions:{
                orderBy: {
                    date: 'desc',
                },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    type: true,
                    amount: true,
                    description: true,
                    date: true,
                    category: true,
                    createdAt: true,
                }
            },
            _count:{
                    select: {
                        transactions: true,
                    }
                },
        }
    });

    if(!account){
        return null;
    }

    return {
        ...serializeTransaction(account),
        transactions: account.transactions.map(serializeTransaction),
    };
    } catch (error) {
        throw new Error(`Failed to get account with transactions: ${error.message}`);
    }
}

export async function recalculateAccountBalance(accountId){
    try {
        const user = await getAuthenticatedUser();

        // Get account with all transactions
        const account = await db.account.findFirst({
            where: {
                id: accountId,
                userId: user.id,
            },
            include: {
                transactions: true
            }
        });

        if(!account){
            throw new Error("Account not found")
        }

        // Calculate balance from all transactions
        const calculatedBalance = account.transactions.reduce((balance, transaction) => {
            if(transaction.type === "EXPENSE") {
                return balance - transaction.amount.toNumber();
            } else {
                return balance + transaction.amount.toNumber();
            }
        }, 0);

        // Update account with correct balance
        const updatedAccount = await db.account.update({
            where: { id: accountId },
            data: { balance: calculatedBalance }
        });

        revalidatePath('/dashboard');
        revalidatePath(`/account/${accountId}`);
        
        return {success: true, data: serializeTransaction(updatedAccount)};
    } catch (error) {
        return {success: false, error: error.message};
    }
}

export async function updateAccount(accountId, data){
    try {
        const user = await getAuthenticatedUser();

        // Validate account belongs to user
        const existingAccount = await db.account.findFirst({
            where: {
                id: accountId,
                userId: user.id,
            }
        });

        if(!existingAccount){
            throw new Error("Account not found")
        }

        const updatedAccount = await db.account.update({
            where: {
                id: accountId,
                userId: user.id,
            },
            data: {
                name: data.name,
                type: data.type,
                minimumBalance: data.minimumBalance,
                monthlyBudget: data.monthlyBudget,
            }
        });

        revalidatePath('/dashboard');
        revalidatePath(`/account/${accountId}`);
        
        return {success: true, data: serializeTransaction(updatedAccount)};
    } catch (error) {
        return {success: false, error: error.message};
    }
}

export async function bulkDeleteTransactions(transactionIds){
    try {
        const user = await getAuthenticatedUser();

        const transactions = await db.transaction.findMany({
            where:{
                id: {in:transactionIds},
                userId:user.id,
            },
        });

        const accountBalanceChanges = transactions.reduce((acc,transaction)=>{
            // When deleting transactions, we need to reverse their effect on balance
            // EXPENSE: was subtracted from balance, so we ADD it back
            // INCOME: was added to balance, so we SUBTRACT it
            const change = transaction.type === "EXPENSE" ? transaction.amount : -transaction.amount;

            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
            return acc;

        },{});


        //delete transaction and update account balances in a transaction
        await db.$transaction(async (tx)=>{
            await tx.transaction.deleteMany({
                 where:{
                id: {in:transactionIds},
                userId:user.id,
            },
            });

            for(const [accountId,balanceChange] of Object.entries(
                accountBalanceChanges )){
                    await tx.account.update({
                        where:{id:accountId},
                        data:{
                            balance:{
                                increment: balanceChange,
                            },
                        },
                    });
                }

        });

            revalidatePath('/dashboard');
            revalidatePath('/account/[id]');

            return {success:true}
    } catch (error) {
        return {success:false,error:error.message}
    }
}