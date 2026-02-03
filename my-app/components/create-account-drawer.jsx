"use client"
import React, { useEffect, useState } from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { Button } from './ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { accountSchema } from '@/app/lib/schema';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CreateAccountDrawer = ({children}) => {

  const [open,setOpen] = useState(false);

 const {register, handleSubmit, formState:{errors},setValue, watch,reset,} =  useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: 'CURRENT',
      balance: 0,
      minimumBalance: 250,
      monthlyBudget: 5000,
      isDefault: false,
    }
  });
      const {data:newAccount, loading:createAccountLoading, error, fn:createAccountFn} = useFetch(createAccount);

    useEffect(() =>{
      if(newAccount && !createAccountLoading){
        toast.success('Account created successfully');
        reset();
        setOpen(false);
      }
    },[createAccountLoading, newAccount]);

    useEffect(() => {
      if(error){
        toast.error(error.message || 'Something went wrong');
        console.error('Error creating account:', error);
      }
    },[error])

  const onSubmit = async (data) => {
    await createAccountFn(data);
}

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-white rounded-t-2xl max-h-[90vh] flex flex-col">
        <DrawerHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b rounded-t-2xl p-6 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DrawerTitle className="text-2xl font-bold text-gray-900">Create New Account</DrawerTitle>
              <DrawerDescription className="text-gray-600">
                Add a new account to start tracking your finances
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className='px-6 py-8 flex-1 overflow-y-auto'>
        <form id="create-account-form" action="" className='space-y-6' onSubmit={handleSubmit(onSubmit)} >
          
          {/* Name */}
          <div className='space-y-2'>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Account Name</label>
            <Input id='name' placeholder='e.g., Main Checking' className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            {...register('name')}/>
            {errors.name && <p className='text-red-500 text-sm'>{errors.name.message}</p>}
          </div>

          {/* Type */}
          <div className="space-y-2">
              <label
                htmlFor="type"
                className="text-sm font-medium text-gray-700"
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type" className="h-10 bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  <SelectItem value="CURRENT" className="hover:bg-gray-100">Current</SelectItem>
                  <SelectItem value="SAVINGS" className="hover:bg-gray-100">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

          {/* Balance */}
          <div className="space-y-2">
  <label
    htmlFor="balance"
    className="text-sm font-medium text-gray-700"
  >
    Initial Balance
  </label>
  <Input
    id="balance"
    type="number"
    step="0.01"
    min="0"
    placeholder="0.00"
    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    {...register("balance", {
      valueAsNumber: true,
      required: "Balance is required",
      min: {
        value: 0,
        message: "Balance cannot be negative",
      },
    })}
  />
  {errors.balance && (
    <p className="text-sm text-red-500">{errors.balance.message}</p>
  )}
</div>

          {/* Minimum Balance */}
          <div className="space-y-2">
  <label
    htmlFor="minimumBalance"
    className="text-sm font-medium text-gray-700"
  >
    Minimum Balance to Maintain
  </label>
  <Input
    id="minimumBalance"
    type="number"
    step="0.01"
    min="0"
    placeholder="250.00"
    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    {...register("minimumBalance", {
      valueAsNumber: true,
      required: "Minimum balance is required",
      min: {
        value: 0,
        message: "Minimum balance cannot be negative",
      },
    })}
  />
  <p className="text-xs text-gray-500">
    The minimum amount you want to keep in this account (default: ₨ 250)
  </p>
  {errors.minimumBalance && (
    <p className="text-sm text-red-500">{errors.minimumBalance.message}</p>
  )}
</div>

          {/* Monthly Budget */}
          <div className="space-y-2">
  <label
    htmlFor="monthlyBudget"
    className="text-sm font-medium text-gray-700"
  >
    Monthly Budget Limit
  </label>
  <Input
    id="monthlyBudget"
    type="number"
    step="0.01"
    min="0"
    placeholder="5000.00"
    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    {...register("monthlyBudget", {
      valueAsNumber: true,
      required: "Monthly budget is required",
      min: {
        value: 0,
        message: "Monthly budget cannot be negative",
      },
    })}
  />
  <p className="text-xs text-gray-500">
    Maximum amount you want to spend from this account per month (default: ₨ 5000)
  </p>
  {errors.monthlyBudget && (
    <p className="text-sm text-red-500">{errors.monthlyBudget.message}</p>
  )}
</div>


          {/* Default Account */}
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
              <div className="space-y-1">
                <label
                  htmlFor="isDefault"
                  className="text-base font-semibold text-gray-900 cursor-pointer"
                >
                  Set as Default Account
                </label>
                <p className="text-sm text-gray-600">
                  This account will be selected by default for new transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
              />
            </div>

        </form>
        </div>

        <DrawerFooter className="flex-shrink-0 border-t bg-white p-6">
          <div className="flex gap-4">
            <DrawerClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 font-semibold"
              >
                Cancel
              </Button>
            </DrawerClose>
            <Button
              type="submit"
              form="create-account-form"
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg"
              disabled={createAccountLoading}
            >
              {createAccountLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateAccountDrawer;
