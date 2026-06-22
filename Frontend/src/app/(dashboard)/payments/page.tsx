"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { paymentApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { PaymentListDto, PaymentMethod, PaymentStatus } from "@/types";
import { motion } from "framer-motion";
import { Trash2, Eye, Banknote } from "lucide-react";
import toast from "react-hot-toast";

const methodOptions = [{ value: "", label: "All Methods" }, ...Object.values(PaymentMethod).map((m) => ({ value: m, label: m }))];
const statusOptions = [{ value: "", label: "All Statuses" }, ...Object.values(PaymentStatus).map((s) => ({ value: s, label: s }))];

export default function PaymentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["payments", { search, method, status, fromDate, toDate, page }],
    queryFn: async () => {
      const res = await paymentApi.list({
        method: method ? (method as PaymentMethod) : undefined,
        status: status ? (status as PaymentStatus) : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        pageSize: 10,
      });
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Payment deleted");
    },
    onError: () => toast.error("Failed to delete payment"),
  });

  const columns: Column<PaymentListDto>[] = [
    { key: "paymentNumber", header: "Payment #", cell: (item) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/10">
          <Banknote className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <span className="font-medium text-white">{item.paymentNumber}</span>
      </div>
    ) },
    { key: "paymentDate", header: "Date", cell: (item) => formatDate(item.paymentDate) },
    { key: "amount", header: "Amount", cell: (item) => <span className="font-semibold text-white">{formatCurrency(item.amount)}</span> },
    { key: "method", header: "Method", cell: (item) => <span className="text-sm text-surface-300">{item.method}</span> },
    { key: "status", header: "Status", cell: (item) => <StatusBadge status={item.status} /> },
    { key: "customerName", header: "Customer" },
    { key: "invoiceNumber", header: "Invoice" },
    { key: "isRefund", header: "Type", cell: (item) => item.isRefund ? <StatusBadge status="Refunded" /> : <span className="text-xs text-surface-400">Payment</span> },
    { key: "actions", header: "", cell: (item) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/payments/${item.id}`)}><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => { if (confirm("Delete this payment?")) deleteMutation.mutate(item.id); }}><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payments</h2>
          <p className="text-surface-400 text-sm mt-1">Track incoming payments and receipts</p>
        </div>
        <Button onClick={() => router.push("/payments/new")} variant="glow"><Banknote className="h-4 w-4 mr-2" /> Record Payment</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by customer or invoice..." className="w-full sm:w-64" />
            <Select options={methodOptions} value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }} className="w-36" />
            <Select options={statusOptions} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-36" />
            <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-36" />
            <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="w-36" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data?.items || []} isLoading={isLoading} page={page} pageSize={10}
            totalCount={data?.totalCount} onPageChange={setPage} onRowClick={(item) => router.push(`/payments/${item.id}`)}
            keyExtractor={(item) => item.id} emptyMessage="No payments found" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
