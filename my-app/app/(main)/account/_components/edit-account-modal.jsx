"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAccount } from "@/actions/account";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "CURRENT", label: "Current Account" },
  { value: "SAVINGS", label: "Savings Account" },
];

export function EditAccountModal({ account, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: account?.name || "",
    type: account?.type || "",
    minimumBalance: account?.minimumBalance?.toString() || "",
    monthlyBudget: account?.monthlyBudget?.toString() || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateAccount(account.id, {
        name: formData.name,
        type: formData.type,
        minimumBalance: parseFloat(formData.minimumBalance),
        monthlyBudget: parseFloat(formData.monthlyBudget),
      });

      if (result.success) {
        toast.success("Account updated successfully!");
        onClose();
      } else {
        toast.error(result.error || "Failed to update account");
      }
    } catch (error) {
      toast.error("An error occurred while updating the account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Account
          </DialogTitle>
          <DialogDescription>
            Update your account details including name, type, minimum balance, and monthly budget.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white">
          <div className="space-y-4 bg-white">
            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter account name"
                required
                disabled={isLoading}
              />
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Account Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Minimum Balance */}
            <div className="space-y-2">
              <Label htmlFor="minimumBalance">Minimum Balance (₨)</Label>
              <Input
                id="minimumBalance"
                type="number"
                step="0.01"
                min="0"
                value={formData.minimumBalance}
                onChange={(e) => handleInputChange("minimumBalance", e.target.value)}
                placeholder="Enter minimum balance"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                The minimum amount you want to maintain in this account
              </p>
            </div>

            {/* Monthly Budget */}
            <div className="space-y-2">
              <Label htmlFor="monthlyBudget">Monthly Budget (₨)</Label>
              <Input
                id="monthlyBudget"
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyBudget}
                onChange={(e) => handleInputChange("monthlyBudget", e.target.value)}
                placeholder="Enter monthly budget"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                Your monthly spending limit for this account
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditAccountModal;
