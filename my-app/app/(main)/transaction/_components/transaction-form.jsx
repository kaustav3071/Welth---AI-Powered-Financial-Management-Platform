"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Users, Receipt, UserPlus, CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import BudgetWarningModal from "@/components/budget-warning-modal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { transactionSchema } from "@/app/lib/schema";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { ReceiptScanner } from "./recipt-scanner";
import { VoiceInput } from "./voice-input";
import { SMSParser } from "./sms-parser";
import { defaultCategories } from "@/data/categories";


export function AddTransactionForm({
  accounts,
  categories,
  transactions = [],
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // Budget warning state
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState("regular");
  const [formKey, setFormKey] = useState(0); // Force re-render key
  const [manualDate, setManualDate] = useState(""); // Manual date state
  

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
    error,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  // Calculate budget information
  const calculateBudgetInfo = (accountId, amount) => {
    const selectedAccount = accounts.find(acc => acc.id === accountId);
    if (!selectedAccount) return null;

    // Get current month's expenses for this account
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate account-level spending
    const accountExpenses = transactions?.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.accountId === accountId &&
             transaction.type === 'EXPENSE' &&
             !transaction.excludeFromBudget;
    }) || [];

    const accountSpent = accountExpenses.reduce((sum, t) => sum + t.amount, 0);
    const accountBudget = selectedAccount.monthlyBudget || 0;

    // Calculate global spending (all accounts)
    const globalExpenses = transactions?.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'EXPENSE' &&
             !transaction.excludeFromBudget;
    }) || [];

    const globalSpent = globalExpenses.reduce((sum, t) => sum + t.amount, 0);
    const globalBudget = 10000; // Default global budget, you can make this configurable

    return {
      accountName: selectedAccount.name,
      accountBudget,
      accountSpent,
      globalBudget,
      globalSpent,
      accountExceeded: accountSpent + amount > accountBudget,
      globalExceeded: globalSpent + amount > globalBudget
    };
  };

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    // Handle split transaction flow
    if (transactionType === "split" && !editMode) {
      // Validate required fields for split
      if (!formData.description || !formData.amount || !formData.category || !formData.accountId) {
        toast.error("Please fill in all required fields before creating a split request");
        return;
      }

      // Redirect to splits page with transaction data
      const params = new URLSearchParams({
        mode: 'create',
        description: formData.description,
        amount: formData.amount.toString(),
        category: formData.category,
        date: formData.date.toISOString(),
        accountId: formData.accountId,
        type: formData.type
      });
      
      router.push(`/splits?${params.toString()}`);
      return;
    }

    // Check budget warnings for expense transactions
    if (formData.type === 'EXPENSE' && formData.accountId) {
      const budgetInfo = calculateBudgetInfo(formData.accountId, formData.amount);
      
      if (budgetInfo && (budgetInfo.accountExceeded || budgetInfo.globalExceeded)) {
        setPendingTransaction(formData);
        setShowBudgetWarning(true);
        return;
      }
    }

    // Proceed with regular transaction
    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleProceedWithTransaction = () => {
    setShowBudgetWarning(false);
    if (pendingTransaction) {
      if (editMode) {
        transactionFn(editId, pendingTransaction);
      } else {
        transactionFn(pendingTransaction);
      }
      setPendingTransaction(null);
    }
  };

  const handleCancelTransaction = () => {
    setShowBudgetWarning(false);
    setPendingTransaction(null);
  };



  useEffect(() => {
    if(transactionResult?.success && !transactionLoading){
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`)
    }
  },[transactionResult,transactionLoading,editMode])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred");
    }
  }, [error]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const amount = watch("amount");
  const accountId = watch("accountId");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  // Check if there are insufficient funds for expense transactions
  const selectedAccount = accounts.find(acc => acc.id === accountId);
  const currentBalance = selectedAccount?.balance || 0;
  const minimumBalance = selectedAccount?.minimumBalance || 0;
  const availableBalance = currentBalance - minimumBalance;
  const expenseAmount = parseFloat(amount) || 0;
  const hasInsufficientFunds = type === "EXPENSE" && expenseAmount > currentBalance;
  const violatesMinimumBalance = type === "EXPENSE" && expenseAmount > availableBalance && expenseAmount <= currentBalance;

    const handleScanComplete = useCallback((scannedData) => {
    if (scannedData) {
      
      // Set the date directly in the text box
      if (scannedData.date) {
        const dateString = typeof scannedData.date === 'string' ? scannedData.date : scannedData.date.toString();
        setManualDate(dateString);
      }
      
      // Convert DD/MM/YYYY to Date object for react-hook-form
      let dateForForm = new Date();
      if (scannedData.date && typeof scannedData.date === 'string' && scannedData.date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [day, month, year] = scannedData.date.split('/');
        dateForForm = new Date(year, month - 1, day);
      }
      
      // Update other form fields
      const formData = {
        amount: scannedData.amount ? scannedData.amount.toString() : "",
        date: dateForForm,
        description: scannedData.description || "",
        category: scannedData.category || "food",
        type: "EXPENSE",
        accountId: getValues("accountId") || "",
        isRecurring: false,
        excludeFromBudget: false
      };
      
      reset(formData);
      setFormKey(prev => prev + 1);
      toast.success("Receipt scanned successfully");
    }
  }, [reset, getValues]);

  const handleVoiceComplete = useCallback((voiceData) => {
    if (voiceData) {
      
      // Set the date directly in the text box
      if (voiceData.date) {
        const dateString = typeof voiceData.date === 'string' ? voiceData.date : voiceData.date.toString();
        setManualDate(dateString);
      }
      
      // Convert DD/MM/YYYY to Date object for react-hook-form
      let dateForForm = new Date();
      if (voiceData.date && typeof voiceData.date === 'string' && voiceData.date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [day, month, year] = voiceData.date.split('/');
        dateForForm = new Date(year, month - 1, day);
      }
      
      setValue("amount", voiceData.amount.toString());
      setValue("type", voiceData.type);
      setValue("date", dateForForm);
      if (voiceData.description) {
        setValue("description", voiceData.description);
      }
      if (voiceData.category) {
        setValue("category", voiceData.category);
      }
      if (voiceData.merchantName) {
        setValue("description", voiceData.merchantName);
      }
    }
  }, [setValue]);

  const handleSMSComplete = useCallback((smsData) => {
    if (smsData) {
      
      // Set the date directly in the text box
      if (smsData.date) {
        const dateString = typeof smsData.date === 'string' ? smsData.date : smsData.date.toString();
        setManualDate(dateString);
      }
      
      // Convert DD/MM/YYYY to Date object for react-hook-form
      let dateForForm = new Date();
      if (smsData.date && typeof smsData.date === 'string' && smsData.date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [day, month, year] = smsData.date.split('/');
        dateForForm = new Date(year, month - 1, day);
      }
      
      // Update other form fields
      const formData = {
        amount: smsData.amount ? smsData.amount.toString() : "",
        date: dateForForm,
        description: smsData.description || smsData.merchantName || "",
        category: smsData.category || "food",
        type: smsData.type || "EXPENSE",
        accountId: getValues("accountId") || "",
        isRecurring: false,
        excludeFromBudget: false
      };
      
      reset(formData);
      setFormKey(prev => prev + 1);
      toast.success("SMS parsed successfully");
    }
  }, [reset, getValues]);

  return (
    <>
<form key={formKey} className="space-y-8 w-full" onSubmit={handleSubmit(onSubmit)}>
  {/* AI Input Methods */}
  {!editMode && (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReceiptScanner onScanComplete={handleScanComplete} />
      <SMSParser onSMSComplete={handleSMSComplete} />
      </div>
    </div>
  )}

  {/* Voice Input - Fixed position */}
  {!editMode && <VoiceInput onVoiceComplete={handleVoiceComplete} />}

  {/* Transaction Mode Selector */}
  {!editMode && (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700 block">Transaction Mode</label>
      <RadioGroup 
        value={transactionType} 
        onValueChange={setTransactionType}
        className="flex gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="regular" id="regular" />
          <Label htmlFor="regular" className="flex items-center gap-2 cursor-pointer">
            <Receipt className="h-4 w-4" />
            Regular Transaction
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="split" id="split" />
          <Label htmlFor="split" className="flex items-center gap-2 cursor-pointer">
            <UserPlus className="h-4 w-4" />
            Split with Friends
          </Label>
        </div>
      </RadioGroup>
      {transactionType === "split" && (
        <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-200">
          💡 You'll be redirected to the splits page to add friends and their shares after filling the basic details.
        </p>
      )}
    </div>
  )}

  {/* Type */}
  <div className="space-y-3">
    <label className="text-sm font-semibold text-gray-700 block">Transaction Type</label>
    <Select onValueChange={(value) => setValue("type", value)} value={watch("type") || ""}>
      <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
        <SelectValue placeholder="Select transaction type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="EXPENSE" className="hover:bg-red-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Expense
          </div>
        </SelectItem>
        <SelectItem value="INCOME" className="hover:bg-green-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Income
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
    {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
  </div>

  {/* Amount and Account */}
  <div className="grid gap-6 md:grid-cols-2 w-full">
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700 block">Amount (₨)</label>
      <Input
        key={`amount-${formKey}`}
        type="number"
        step="0.01"
        placeholder="0.00"
        className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-lg"
        {...register("amount")}
      />
      {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
      
      {/* Balance Warning for Expense Transactions */}
      {type === "EXPENSE" && accountId && amount && (
        (() => {
          const selectedAccount = accounts.find(acc => acc.id === accountId);
          const currentBalance = selectedAccount?.balance || 0;
          const minimumBalance = selectedAccount?.minimumBalance || 0;
          const availableBalance = currentBalance - minimumBalance;
          const expenseAmount = parseFloat(amount) || 0;
          const isInsufficient = expenseAmount > currentBalance;
          const violatesMinimum = expenseAmount > availableBalance && expenseAmount <= currentBalance;
          
          return (
            <div className={`text-sm p-2 rounded-md ${
              isInsufficient || violatesMinimum
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {isInsufficient ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span>
                    Insufficient funds! Available: ₨ {currentBalance.toFixed(2)}, Required: ₨ {expenseAmount.toFixed(2)}
                  </span>
                </div>
              ) : violatesMinimum ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span>
                    Cannot go below minimum balance! Available for spending: ₨ {availableBalance.toFixed(2)}, Required: ₨ {expenseAmount.toFixed(2)}, Min. to maintain: ₨ {minimumBalance.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>
                    Sufficient funds. Available for spending: ₨ {availableBalance.toFixed(2)} (Min. to maintain: ₨ {minimumBalance.toFixed(2)})
                  </span>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>

    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700 block">Account</label>
      <Select onValueChange={(value) => setValue("accountId", value)} value={watch("accountId") || ""}>
        <SelectTrigger className="w-full h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id} className="hover:bg-blue-50">
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{account.name}</span>
                <span className="text-sm text-gray-500 ml-2">₨ {parseFloat(account.balance).toFixed(2)}</span>
              </div>
            </SelectItem>
          ))}
          <CreateAccountDrawer>
            <Button
              variant="ghost"
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            >
              Create Account
            </Button>
          </CreateAccountDrawer>
        </SelectContent>
      </Select>
      {errors.accountId && <p className="text-sm text-red-500">{errors.accountId.message}</p>}
    </div>
  </div>

  {/* Category */}
  <div className="space-y-2 w-full">
    <label className="text-sm font-medium block">Category</label>
    <Select onValueChange={(value) => setValue("category", value)} value={watch("category") || ""}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {filteredCategories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
  </div>

  {/* Date */}
  <div className="space-y-2 w-full">
    <label className="text-sm font-medium block">Date</label>
    <div className="flex gap-2">
      <Input
        key={`date-input-${formKey}`}
        type="text"
        placeholder="DD/MM/YYYY"
        value={manualDate}
        onChange={(e) => {
          const inputValue = e.target.value;
          setManualDate(inputValue);
          
          // Try to parse the date if it looks like a date
          if (inputValue.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            const [day, month, year] = inputValue.split('/');
            const parsedDate = new Date(year, month - 1, day);
            if (!isNaN(parsedDate.getTime())) {
              setValue("date", parsedDate, { shouldValidate: true, shouldDirty: true });
            }
          }
        }}
        className="flex-1"
      />
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
            size="icon"
            className="shrink-0"
        >
            <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                setValue("date", selectedDate, { shouldValidate: true, shouldDirty: true });
                setManualDate(format(selectedDate, "dd/MM/yyyy"));
              }
            }}
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
    </div>
    <div className="text-xs text-gray-500">
      Date must be in DD/MM/YYYY format
    </div>
    {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
  </div>

  {/* Description */}
  <div className="space-y-2 w-full">
    <label className="text-sm font-medium block">Description</label>
    <Input
      key={`description-${formKey}`}
      className="w-full"
      placeholder="Enter description"
      {...register("description")}
    />
    {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
  </div>

  {/* Recurring Toggle */}
  <div className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
    <div className="space-y-0.5">
      <label className="text-base font-medium">Recurring Transaction</label>
      <div className="text-sm text-muted-foreground">
        Set up a recurring schedule for this transaction
      </div>
    </div>
    <Switch
      checked={isRecurring}
      onCheckedChange={(checked) => setValue("isRecurring", checked)}
    />
  </div>


  {/* Exclude from Budget Toggle */}
  <div className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
    <div className="space-y-0.5">
      <label className="text-base font-medium">Exclude from Monthly Budget</label>
      <div className="text-sm text-muted-foreground">
        This transaction will not count towards your monthly budget
      </div>
    </div>
    <Switch
      checked={watch("excludeFromBudget") || false}
      onCheckedChange={(checked) => setValue("excludeFromBudget", checked)}
    />
  </div>

  {/* Recurring Interval */}
  {isRecurring && (
    <div className="space-y-2 w-full">
      <label className="text-sm font-medium block">Recurring Interval</label>
      <Select
        onValueChange={(value) => setValue("recurringInterval", value)}
        defaultValue={getValues("recurringInterval") || ""}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select interval" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DAILY">Daily</SelectItem>
          <SelectItem value="WEEKLY">Weekly</SelectItem>
          <SelectItem value="MONTHLY">Monthly</SelectItem>
          <SelectItem value="YEARLY">Yearly</SelectItem>
        </SelectContent>
      </Select>
      {errors.recurringInterval && (
        <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
      )}
    </div>
  )}

  {/* Actions */}
   <div className="flex gap-4">
  <Button
    type="button"
    variant="outline"
    className="flex items-center justify-center font-semibold py-3"
    onClick={() => router.back()}
  >
    Cancel
  </Button>

  <Button
    type="submit"
    className="flex items-center justify-center font-semibold py-3 disabled:opacity-70 disabled:cursor-not-allowed"
    disabled={transactionLoading || hasInsufficientFunds || violatesMinimumBalance}
  >
   {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : hasInsufficientFunds ? (
            "Insufficient Funds"
          ) : violatesMinimumBalance ? (
            "Below Minimum Balance"
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
  </Button>
</div>


</form>

      {/* Budget Warning Modal */}
      {showBudgetWarning && pendingTransaction && (
        <BudgetWarningModal
          isOpen={showBudgetWarning}
          onClose={handleCancelTransaction}
          onProceed={handleProceedWithTransaction}
          accountName={pendingTransaction.accountId ? accounts.find(acc => acc.id === pendingTransaction.accountId)?.name : ''}
          accountBudget={pendingTransaction.accountId ? accounts.find(acc => acc.id === pendingTransaction.accountId)?.monthlyBudget || 0 : 0}
          accountSpent={pendingTransaction.accountId ? calculateBudgetInfo(pendingTransaction.accountId, 0)?.accountSpent || 0 : 0}
          globalBudget={10000} // Default global budget
          globalSpent={calculateBudgetInfo(pendingTransaction.accountId, 0)?.globalSpent || 0}
          transactionAmount={pendingTransaction.amount}
        />
      )}
    </>
  )
}

export default AddTransactionForm;
