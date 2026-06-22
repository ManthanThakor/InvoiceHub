"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi, invoiceApi, purchaseOrderApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowLeft, Banknote, Save } from "lucide-react";
import toast from "react-hot-toast";
import { PaymentMethod, RecordPaymentDto } from "@/types";

const methodOptions = Object.values(PaymentMethod).map((m) => ({ value: m, label: m.replace(/([A-Z])/g, ' $1').trim() }));

export default function RecordPaymentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    invoiceSearch: "",
    selectedInvoiceId: "",
    selectedInvoiceNumber: "",
    selectedInvoiceCustomer: "",
    selectedInvoiceBalance: 0,
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    method: PaymentMethod.BankTransfer,
    referenceNumber: "",
    bankName: "",
    notes: "",
  });

  const update = useCallback((patch: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const { data: invoiceResults } = useQuery({
    queryKey: ["invoice-search-payment", form.invoiceSearch],
    queryFn: async () => {
      if (!form.invoiceSearch) return { items: [] };
      const res = await invoiceApi.list({ search: form.invoiceSearch, pageSize: 10 });
      return res.data.data;
    },
    enabled: form.invoiceSearch.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: RecordPaymentDto) => paymentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Payment recorded successfully");
      router.push("/payments");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to record payment"),
  });

  const handleSubmit = async () => {
    if (!form.selectedInvoiceId) { toast.error("Please select an invoice"); return; }
    if (!form.amount || form.amount <= 0) { toast.error("Enter a valid amount"); return; }
    if (form.amount > form.selectedInvoiceBalance) { toast.error("Amount exceeds invoice balance"); return; }

    createMutation.mutate({
      invoiceId: form.selectedInvoiceId,
      amount: form.amount,
      paymentDate: form.paymentDate,
      method: form.method,
      referenceNumber: form.referenceNumber || undefined,
      bankName: form.bankName || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Record Payment</h2>
          <p className="text-surface-400 text-sm">Record an incoming payment from a customer</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Search Invoice</label>
            <Input
              value={form.invoiceSearch}
              onChange={(e) => update({ invoiceSearch: e.target.value })}
              placeholder="Search by invoice number or customer name..."
            />
            {form.invoiceSearch && invoiceResults?.items && invoiceResults.items.length > 0 && !form.selectedInvoiceId && (
              <div className="mt-2 rounded-xl glass-dark p-1 border border-surface-700/50 max-h-48 overflow-y-auto">
                {invoiceResults.items.map((inv: any) => (
                  <button
                    key={inv.id}
                    onClick={() => update({
                      selectedInvoiceId: inv.id,
                      selectedInvoiceNumber: inv.invoiceNumber,
                      selectedInvoiceCustomer: inv.customerName,
                      selectedInvoiceBalance: inv.balanceDue,
                      invoiceSearch: `${inv.invoiceNumber} - ${inv.customerName}`,
                      amount: inv.balanceDue,
                    })}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg hover:bg-surface-700/50 text-left transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white">{inv.invoiceNumber}</p>
                      <p className="text-xs text-surface-400">{inv.customerName}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">₹{inv.balanceDue.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
            {form.selectedInvoiceId && (
              <div className="mt-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-400">{form.selectedInvoiceNumber}</p>
                    <p className="text-xs text-surface-400">{form.selectedInvoiceCustomer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-surface-400">Balance</p>
                    <p className="text-sm font-semibold text-white">₹{form.selectedInvoiceBalance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount *"
              type="number"
              min="0"
              step="0.01"
              value={form.amount || ""}
              onChange={(e) => update({ amount: Number(e.target.value) })}
            />
            <Input
              label="Payment Date *"
              type="date"
              value={form.paymentDate}
              onChange={(e) => update({ paymentDate: e.target.value })}
            />
          </div>

          <Select
            label="Payment Method *"
            options={methodOptions}
            value={form.method}
            onChange={(e) => update({ method: e.target.value as PaymentMethod })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Reference Number"
              value={form.referenceNumber}
              onChange={(e) => update({ referenceNumber: e.target.value })}
              placeholder="Cheque/Transaction ID"
            />
            <Input
              label="Bank Name"
              value={form.bankName}
              onChange={(e) => update({ bankName: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={2}
              className="flex w-full rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 resize-none"
              placeholder="Optional notes..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button variant="glow" onClick={handleSubmit} isLoading={createMutation.isPending}>
          <Banknote className="h-4 w-4 mr-2" /> Record Payment
        </Button>
      </div>
    </motion.div>
  );
}
