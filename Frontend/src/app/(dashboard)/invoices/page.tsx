"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { invoiceApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate, downloadBlob } from "@/lib/utils/cn";
import { InvoiceListDto, InvoiceStatus } from "@/types";
import { motion } from "framer-motion";
import { Plus, FileText, Download, Send, XCircle, Filter } from "lucide-react";
import toast from "react-hot-toast";

const statusOptions = [
  { value: "", label: "All Statuses" },
  ...Object.values(InvoiceStatus).map((s) => ({ value: s, label: s.replace(/([A-Z])/g, ' $1').trim() })),
];

export default function InvoicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", { search, status, page, sortBy, sortDesc }],
    queryFn: async () => {
      const res = await invoiceApi.list({ search: search || undefined, status: status ? (status as InvoiceStatus) : undefined, page, pageSize: 10, sortBy, sortDesc });
      return res.data.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice cancelled");
    },
    onError: () => toast.error("Failed to cancel invoice"),
  });

  const columns: Column<InvoiceListDto>[] = [
    { key: "invoiceNumber", header: "Invoice #", cell: (item) => <span className="font-medium text-white">{item.invoiceNumber}</span>, sortable: true },
    { key: "customerName", header: "Customer", sortable: true },
    { key: "invoiceDate", header: "Date", cell: (item) => formatDate(item.invoiceDate), sortable: true },
    { key: "dueDate", header: "Due Date", cell: (item) => formatDate(item.dueDate), sortable: true },
    { key: "grandTotal", header: "Amount", cell: (item) => <span className="font-semibold text-white">{formatCurrency(item.grandTotal)}</span>, sortable: true },
    { key: "balanceDue", header: "Balance", cell: (item) => (
      <span className={item.balanceDue > 0 ? "text-red-400" : "text-emerald-400"}>{formatCurrency(item.balanceDue)}</span>
    )},
    { key: "status", header: "Status", cell: (item) => <StatusBadge status={item.status} /> },
    { key: "actions", header: "Actions", cell: (item) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/invoices/${item.id}`)} title="View"><FileText className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => invoiceApi.downloadPdf(item.id).then(r => downloadBlob(new Blob([r.data], { type: "application/pdf" }), `${item.invoiceNumber}.pdf`))} title="Download PDF"><Download className="h-4 w-4" /></Button>
        {item.status === InvoiceStatus.Draft && (
          <Button variant="ghost" size="icon" onClick={() => invoiceApi.send(item.id).then(() => { toast.success("Invoice sent"); queryClient.invalidateQueries({ queryKey: ["invoices"] }); })} title="Send"><Send className="h-4 w-4" /></Button>
        )}
        {(item.status === InvoiceStatus.Draft || item.status === InvoiceStatus.Sent) && (
          <Button variant="ghost" size="icon" onClick={() => cancelMutation.mutate(item.id)} title="Cancel" className="text-red-400 hover:text-red-300"><XCircle className="h-4 w-4" /></Button>
        )}
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Invoices</h2>
          <p className="text-surface-400 text-sm mt-1">Manage and track all your invoices</p>
        </div>
        <Button onClick={() => router.push("/invoices/new")} variant="glow">
          <Plus className="h-4 w-4 mr-2" /> Create Invoice
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search invoices..." className="w-full sm:w-64" />
              <Select options={statusOptions} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data?.items || []}
            isLoading={isLoading}
            page={page}
            pageSize={10}
            totalCount={data?.totalCount}
            onPageChange={setPage}
            onSort={(key, desc) => { setSortBy(key); setSortDesc(desc); }}
            sortBy={sortBy}
            sortDesc={sortDesc}
            onRowClick={(item) => router.push(`/invoices/${item.id}`)}
            keyExtractor={(item) => item.id}
            emptyMessage="No invoices found"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
