"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl p-6">
        <div className="flex flex-row items-center justify-between space-y-0">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Pencil className="h-4 w-4 text-white" />
              </div>
              Monthly Budget
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Track your spending against your monthly budget
            </CardDescription>
            <div className="flex items-center gap-2 mt-3">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-40 h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter amount"
                    autoFocus
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUpdateBudget}
                    disabled={isLoading}
                    className="h-9 w-9 p-0 hover:bg-green-100"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="h-9 w-9 p-0 hover:bg-red-100"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-700">
                    {initialBudget
                      ? `₨ ${currentExpenses.toFixed(2)} of ₨ ${initialBudget.amount.toFixed(2)} spent`
                      : "No budget set"}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8 p-0 hover:bg-blue-100"
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {initialBudget ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Budget Progress</span>
              <span className={`text-sm font-semibold ${
                percentUsed >= 80 ? 'text-red-600' : 
                percentUsed >= 75 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {percentUsed.toFixed(1)}% used
              </span>
            </div>
            <div className="relative">
              <Progress
                value={percentUsed}
                extrastyles={`${
                  percentUsed >= 80
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : percentUsed >= 75
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                      : "bg-gradient-to-r from-green-500 to-green-600"
                }`}
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>₨ 0</span>
                <span>₨ {initialBudget.amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-gray-600">
                Remaining: <span className="font-semibold text-gray-900">
                  ₨ {(initialBudget.amount - currentExpenses).toFixed(2)}
                </span>
              </div>
              <div className={`text-sm font-medium ${
                percentUsed >= 80 ? 'text-red-600' : 
                percentUsed >= 75 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {percentUsed >= 80 ? 'Over Budget!' : 
                 percentUsed >= 75 ? 'Almost at Limit' : 'On Track'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pencil className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Budget Set</h3>
            <p className="text-gray-600 mb-4">Set a monthly budget to track your spending</p>
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              Set Budget
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default BudgetProgress;