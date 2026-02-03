"use client";

import { ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";

export function AccountCard({ account }) {
  const { name, type, balance, minimumBalance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault(); // Prevent navigation

    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return; // Don't allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
      // Refresh the page to update the dashboard header
      window.location.reload();
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  const getAccountIcon = (accountType) => {
    switch (accountType.toLowerCase()) {
      case 'checking':
        return '🏦';
      case 'savings':
        return '💰';
      case 'credit':
        return '💳';
      case 'investment':
        return '📈';
      default:
        return '🏛️';
    }
  };

  const getAccountGradient = (accountType) => {
    switch (accountType.toLowerCase()) {
      case 'checking':
        return 'from-blue-500 to-blue-600';
      case 'savings':
        return 'from-green-500 to-green-600';
      case 'credit':
        return 'from-purple-500 to-purple-600';
      case 'investment':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative border-0 overflow-hidden h-full">
      <Link href={`/account/${id}`} className="block h-full">
        {/* Header with gradient background */}
        <div className={`bg-gradient-to-r ${getAccountGradient(type)} p-6 text-white relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{getAccountIcon(type)}</div>
              <div>
                <CardTitle className="text-xl font-bold capitalize text-white">
                  {name}
                </CardTitle>
                <p className="text-white/80 text-sm">
                  {type.charAt(0) + type.slice(1).toLowerCase()} Account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDefault && (
                <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-xs font-semibold text-white">Default</span>
                </div>
              )}
              <Switch
                checked={isDefault}
                onClick={handleDefaultChange}
                disabled={updateDefaultLoading}
                className="data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-white/20"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="space-y-6 flex-1">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ₨ {parseFloat(balance).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 font-medium">Current Balance</p>
              <div className="mt-2 text-xs text-gray-500">
                Min. to maintain: ₨ {parseFloat(minimumBalance).toFixed(2)}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-xs font-semibold">Income</span>
                </div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="text-xs font-semibold">Expenses</span>
                </div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>
    </Card>
  );
}
export default AccountCard;