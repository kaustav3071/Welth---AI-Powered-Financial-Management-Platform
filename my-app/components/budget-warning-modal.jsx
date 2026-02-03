"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";

export default function BudgetWarningModal({ 
  isOpen, 
  onClose, 
  onProceed, 
  accountName, 
  accountBudget, 
  accountSpent, 
  globalBudget, 
  globalSpent,
  transactionAmount 
}) {
  if (!isOpen) return null;

  const accountExceeded = accountSpent + transactionAmount > accountBudget;
  const globalExceeded = globalSpent + transactionAmount > globalBudget;
  const accountRemaining = accountBudget - accountSpent;
  const globalRemaining = globalBudget - globalSpent;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <CardTitle className="text-lg font-semibold text-gray-900">
                Budget Warning
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            This transaction of <span className="font-semibold">₨ {transactionAmount.toFixed(2)}</span> will exceed your budget limits:
          </div>

          {/* Account Budget Warning */}
          {accountExceeded && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-800">Account Budget Exceeded</span>
              </div>
              <div className="text-sm text-red-700">
                <div>Account: <span className="font-semibold">{accountName}</span></div>
                <div>Budget: ₨ {accountBudget.toFixed(2)}</div>
                <div>Spent: ₨ {accountSpent.toFixed(2)}</div>
                <div>Remaining: ₨ {accountRemaining.toFixed(2)}</div>
                <div className="font-semibold mt-1">
                  After transaction: ₨ {(accountSpent + transactionAmount).toFixed(2)} (Exceeds by ₨ {(accountSpent + transactionAmount - accountBudget).toFixed(2)})
                </div>
              </div>
            </div>
          )}

          {/* Global Budget Warning */}
          {globalExceeded && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-orange-800">Global Budget Exceeded</span>
              </div>
              <div className="text-sm text-orange-700">
                <div>Total Monthly Budget: ₨ {globalBudget.toFixed(2)}</div>
                <div>Total Spent: ₨ {globalSpent.toFixed(2)}</div>
                <div>Remaining: ₨ {globalRemaining.toFixed(2)}</div>
                <div className="font-semibold mt-1">
                  After transaction: ₨ {(globalSpent + transactionAmount).toFixed(2)} (Exceeds by ₨ {(globalSpent + transactionAmount - globalBudget).toFixed(2)})
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600">
            Do you still want to proceed with this transaction?
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onProceed}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Proceed Anyway
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
