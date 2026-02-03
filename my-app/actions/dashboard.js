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
}

export async function createAccount(data) {
    try {
        const user = await getAuthenticatedUser();

        const balanceFloat  = parseFloat(data.balance);
        if(isNaN(balanceFloat)) {
            throw new Error("Invalid balance value");
        }

        const existingAccount = await db.account.findMany({
            where:{
                userId: user.id
            },
        });

        const shouldBeDefault = existingAccount.length===0?true:data.isDefault;

        
        if (shouldBeDefault) {
            await db.account.updateMany({
                where: {
                    userId: user.id,
                    isDefault: true,
                },
                data: {
                    isDefault: false,
                },
            });
        }

        const account = await db.account.create({
            data:{
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });

        const serializedAccount =  serializeTransaction(account);

        revalidatePath("/dashboard");
        return { success: true, account: serializedAccount };

    } catch (error) {
        throw new Error(`Failed to create account: ${error.message}`);
    }
}

export async function getUserAccounts(){
    try {
        const user = await getAuthenticatedUser();

         const accounts = await db.account.findMany({
            where: {
                userId: user.id
            },
            orderBy:{
                createdAt: 'desc'
            },

            include:{
               _count:{
                select:{
                    transactions: true,
                },
               },
            },


         })
           const serializedAccount =  accounts.map(serializeTransaction);
         return serializedAccount;
    } catch (error) {
        throw new Error(`Failed to get user accounts: ${error.message}`);
    }
}

export async function getDashboardData() {
  try {
    const user = await getAuthenticatedUser();

    // Get all user transactions
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return transactions.map(serializeTransaction);
  } catch (error) {
    throw new Error(`Failed to get dashboard data: ${error.message}`);
  }
}

export async function getCurrentUser() {
    try {
        const user = await getAuthenticatedUser();
        return serializeTransaction(user);
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}