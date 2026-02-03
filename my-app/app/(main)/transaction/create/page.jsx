import { getUserAccounts, getDashboardData } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import React from 'react';
import AddTransactionForm from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

const AddTransactionPage = async ({searchParams}) => {
  const accounts = await getUserAccounts();
  const transactions = await getDashboardData();
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams?.edit;
  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold gradient-title mb-2">
          {editId ? "Edit Transaction" : "Add Transaction"}
        </h1>
        <p className="text-gray-600 text-lg">
          {editId ? "Update your transaction details" : "Record a new income or expense"}
        </p>
      </div>

      {/* Transaction Form Card */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
          <AddTransactionForm
            accounts={accounts}
            categories={defaultCategories}
            transactions={transactions}
            editMode={!!editId}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
};

export default AddTransactionPage;
