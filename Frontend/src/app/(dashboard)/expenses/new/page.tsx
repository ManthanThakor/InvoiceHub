"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { expenseApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Upload, X, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils/cn";
import toast from "react-hot-toast";
import { ExpenseCategory, PaymentMethod } from "@/types";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.nativeEnum(ExpenseCategory),
  expenseDate: z.string().min(1, "Date is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  gstAmount: z.coerce.number().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  vendorName: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

export default function NewExpensePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      category: ExpenseCategory.Other,
      paymentMethod: PaymentMethod.Cash,
      expenseDate: new Date().toISOString().split("T")[0],
    },
  });

  const amount = Number(watch("amount")) || 0;
  const gstAmount = Number(watch("gstAmount")) || 0;
  const totalAmount = amount + gstAmount;

  const onSubmit = async (data: ExpenseForm) => {
    setIsLoading(true);
    try {
      const res = await expenseApi.create(data);
      if (receiptFile) {
        await expenseApi.uploadReceipt(res.data.data.id, receiptFile);
      }
      toast.success("Expense created successfully");
      router.push("/expenses");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Add Expense</h2>
          <p className="text-surface-400 text-sm">Record a new business expense</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Expense Details</CardTitle><CardDescription>Basic information about the expense</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Title *" placeholder="Office supplies, Travel fare..." error={errors.title?.message} {...register("title")} />
              </div>
              <Select label="Category *" options={Object.values(ExpenseCategory).map((c) => ({ value: c, label: c }))} error={errors.category?.message} {...register("category")} />
              <Input label="Date *" type="date" error={errors.expenseDate?.message} {...register("expenseDate")} />
              <Input label="Amount *" type="number" step="0.01" placeholder="0.00" error={errors.amount?.message} {...register("amount")} />
              <Input label="GST Amount" type="number" step="0.01" placeholder="0.00" {...register("gstAmount")} />
              <Select label="Payment Method *" options={Object.values(PaymentMethod).map((m) => ({ value: m, label: m }))} {...register("paymentMethod")} />
              <Input label="Vendor Name" placeholder="Vendor or supplier name" {...register("vendorName")} />
              <Input label="Reference Number" placeholder="Bill / invoice number" {...register("referenceNumber")} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Receipt</label>
              <input type="file" ref={fileInputRef} accept="image/*,.pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} className="hidden" />
              {receiptFile ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 border border-surface-700">
                  <span className="text-sm text-surface-200 flex-1 truncate">{receiptFile.name}</span>
                  <span className="text-xs text-surface-400">{(receiptFile.size / 1024).toFixed(1)} KB</span>
                  <button type="button" onClick={() => { setReceiptFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-surface-500 hover:text-red-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 p-3 w-full rounded-lg border border-dashed border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-500 transition-colors text-sm">
                  <Upload className="h-4 w-4" /> Upload receipt (image or PDF)
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Notes</label>
              <textarea rows={3} className="flex w-full rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 resize-none" placeholder="Optional notes..." {...register("notes")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary-400" />
              <CardTitle>Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/5 border border-primary-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-surface-400">Total Expense</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="pt-3 border-t border-primary-500/10 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-surface-400">Amount</span>
                  <span className="text-surface-200">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-surface-400">GST</span>
                  <span className="text-blue-400">{formatCurrency(gstAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}><Save className="h-4 w-4 mr-2" /> Save Expense</Button>
        </div>
      </form>
    </motion.div>
  );
}
