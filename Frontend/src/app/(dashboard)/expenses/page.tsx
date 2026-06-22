"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { expenseApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { ExpenseListDto, ExpenseCategory, PaymentMethod } from "@/types";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, Receipt } from "lucide-react";
import toast from "react-hot-toast";

const categoryOptions = [{ value: "", label: "All Categories" }, ...Object.values(ExpenseCategory).map((c) => ({ value: c, label: c }))];

export default function ExpensesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("expenseDate");
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", { search, category, fromDate, toDate, page, sortBy, sortDesc }],
    queryFn: async () => {
      const res = await expenseApi.list({
        search: search || undefined,
        category: category ? (category as ExpenseCategory) : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        pageSize: 10,
        sortBy,
        sortDesc,
      });
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted");
    },
    onError: () => toast.error("Failed to delete expense"),
  });

  const columns: Column<ExpenseListDto>[] = [
    { key: "title", header: "Title", cell: (item) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-red-500/10">
          <Receipt className="h-3.5 w-3.5 text-red-400" />
        </div>
        <span className="font-medium text-white">{item.title}</span>
      </div>
    ), sortable: true },
    { key: "category", header: "Category", cell: (item) => <StatusBadge status={item.category} /> },
    { key: "expenseDate", header: "Date", cell: (item) => formatDate(item.expenseDate), sortable: true },
    { key: "totalAmount", header: "Amount", cell: (item) => <span className="font-semibold text-white">{formatCurrency(item.totalAmount)}</span>, sortable: true },
    { key: "paymentMethod", header: "Payment", cell: (item) => <span className="text-sm text-surface-300">{item.paymentMethod}</span> },
    { key: "vendorName", header: "Vendor" },
    { key: "referenceNumber", header: "Reference" },
    { key: "actions", header: "", cell: (item) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/expenses/${item.id}`)}><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/expenses/${item.id}/edit`)}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => { if (confirm("Delete this expense?")) deleteMutation.mutate(item.id); }}><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Expenses</h2>
          <p className="text-surface-400 text-sm mt-1">Track and manage business expenses</p>
        </div>
        <Button onClick={() => router.push("/expenses/new")} variant="glow"><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search expenses..." className="w-full sm:w-64" />
            <Select options={categoryOptions} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-36" />
            <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-40" />
            <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="w-40" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data?.items || []} isLoading={isLoading} page={page} pageSize={10}
            totalCount={data?.totalCount} onPageChange={setPage} onSort={(k, d) => { setSortBy(k); setSortDesc(d); }}
            sortBy={sortBy} sortDesc={sortDesc} onRowClick={(item) => router.push(`/expenses/${item.id}`)}
            keyExtractor={(item) => item.id} emptyMessage="No expenses found" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
