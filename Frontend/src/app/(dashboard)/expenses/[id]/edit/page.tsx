"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { expenseApi } from "@/lib/api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
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

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: expense, isLoading: isFetching } = useQuery({
    queryKey: ["expense", params.id],
    queryFn: async () => {
      const res = await expenseApi.getById(params.id);
      return res.data.data;
    },
    enabled: !!params.id,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema) as any,
  });

  useEffect(() => {
    if (expense) {
      reset({
        title: expense.title,
        category: expense.category,
        expenseDate: expense.expenseDate?.split("T")[0] || "",
        amount: expense.amount,
        gstAmount: expense.gstAmount || undefined,
        paymentMethod: expense.paymentMethod,
        vendorName: expense.vendorName || "",
        referenceNumber: expense.referenceNumber || "",
        notes: expense.notes || "",
      });
    }
  }, [expense, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ExpenseForm) => expenseApi.update(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", params.id] });
      toast.success("Expense updated successfully");
      router.push(`/expenses/${params.id}`);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update expense"),
  });

  if (isFetching) return <PageLoading />;
  if (!expense) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Expense</h2>
          <p className="text-surface-400 text-sm">{expense.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
        <Card>
          <CardHeader><CardTitle>Expense Details</CardTitle><CardDescription>Modify expense information</CardDescription></CardHeader>
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
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Notes</label>
              <textarea rows={3} className="flex w-full rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 resize-none" placeholder="Optional notes..." {...register("notes")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={updateMutation.isPending}><Save className="h-4 w-4 mr-2" /> Update Expense</Button>
        </div>
      </form>
    </motion.div>
  );
}
