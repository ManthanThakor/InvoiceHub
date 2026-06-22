"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { purchaseOrderApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { PurchaseOrderListDto, PurchaseOrderStatus } from "@/types";
import { motion } from "framer-motion";
import { Plus, Eye, Edit, Trash2, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";

const statusOptions = [{ value: "", label: "All Statuses" }, ...Object.values(PurchaseOrderStatus).map((s) => ({ value: s, label: s }))];

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("poDate");
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["purchase-orders", { search, status, fromDate, toDate, page, sortBy, sortDesc }],
    queryFn: async () => {
      const res = await purchaseOrderApi.list({
        search: search || undefined,
        status: status ? (status as PurchaseOrderStatus) : undefined,
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
    mutationFn: (id: string) => purchaseOrderApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order cancelled");
    },
    onError: () => toast.error("Failed to cancel purchase order"),
  });

  const columns: Column<PurchaseOrderListDto>[] = [
    { key: "poNumber", header: "PO #", cell: (item) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <ClipboardList className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <span className="font-medium text-white">{item.poNumber}</span>
      </div>
    ), sortable: true },
    { key: "poDate", header: "Date", cell: (item) => formatDate(item.poDate), sortable: true },
    { key: "supplierName", header: "Supplier", sortable: true },
    { key: "grandTotal", header: "Amount", cell: (item) => <span className="font-semibold text-white">{formatCurrency(item.grandTotal)}</span>, sortable: true },
    { key: "paidAmount", header: "Paid", cell: (item) => <span className="text-emerald-400">{formatCurrency(item.paidAmount)}</span> },
    { key: "balanceDue", header: "Balance", cell: (item) => <span className={item.balanceDue > 0 ? "text-red-400" : "text-surface-400"}>{formatCurrency(item.balanceDue)}</span> },
    { key: "status", header: "Status", cell: (item) => <StatusBadge status={item.status} /> },
    { key: "actions", header: "", cell: (item) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/purchase-orders/${item.id}`)} title="View"><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/purchase-orders/${item.id}/edit`)} title="Edit"><Edit className="h-4 w-4" /></Button>
        {item.status !== PurchaseOrderStatus.Cancelled && item.status !== PurchaseOrderStatus.Received && (
          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => { if (confirm("Cancel this purchase order?")) deleteMutation.mutate(item.id); }} title="Cancel">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Purchase Orders</h2>
          <p className="text-surface-400 text-sm mt-1">Manage orders placed with suppliers</p>
        </div>
        <Button onClick={() => router.push("/purchase-orders/new")} variant="glow"><Plus className="h-4 w-4 mr-2" /> New Purchase Order</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search POs..." className="w-full sm:w-64" />
            <Select options={statusOptions} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-36" />
            <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-40" />
            <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="w-40" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data?.items || []} isLoading={isLoading} page={page} pageSize={10}
            totalCount={data?.totalCount} onPageChange={setPage} onSort={(k, d) => { setSortBy(k); setSortDesc(d); }}
            sortBy={sortBy} sortDesc={sortDesc} onRowClick={(item) => router.push(`/purchase-orders/${item.id}`)}
            keyExtractor={(item) => item.id} emptyMessage="No purchase orders found" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
