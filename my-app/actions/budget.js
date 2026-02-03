"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/user-helper";


export async function getCurrentBudget(accountId = null) {
  try {
    const user = await getAuthenticatedUser();

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get expenses for the current month from ALL accounts (unless excluded from budget)
    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        excludeFromBudget: false, // Only include transactions that are NOT excluded from budget
        ...(accountId && { accountId }), // only filter by account if provided
      },
      _sum: {
        amount: true,
      },
    });

    const currentExpenses = expenses._sum.amount ? expenses._sum.amount.toNumber() : 0;

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: currentExpenses,
    };
  } catch (error) {
    console.error("Error in getCurrentBudget:", error);
    throw error;
  }
}



export async function updateBudget(amount) {
  try {
    const user = await getAuthenticatedUser();

    // Update or create budget
    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}
