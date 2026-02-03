import {z} from 'zod';

export const accountSchema = z.object({

    name: z.string().min(1, "Account name is required"),
    type: z.enum(['SAVINGS', 'CURRENT'], {
        errorMap: () => ({ message: "Please select a valid account type" })
    }),
    balance: z.number().min(1, "Balance is required"),
    minimumBalance: z.number().min(0, "Minimum balance must be 0 or greater"),
    monthlyBudget: z.number().min(0, "Monthly budget must be 0 or greater"),
    isDefault:z.boolean().default(false),
});


export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
    excludeFromBudget: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required for recurring transactions",
        path: ["recurringInterval"],
      });
    }
  });


