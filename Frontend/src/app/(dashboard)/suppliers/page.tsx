"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { supplierApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { SupplierListDto, SupplierStatus } from "@/types";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, Building2 } from "lucide-react";
import toast from "react-hot-toast";

const statusOptions = [{ value: "", label: "All Statuses" }, ...Object.values(SupplierStatus).map((s) => ({ value: s, label: s }))];

export default function SuppliersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortDesc, setSortDesc] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", { search, status, page, sortBy, sortDesc }],
    queryFn: async () => {
      const res = await supplierApi.list({ search: search || undefined, status: status ? (status as SupplierStatus) : undefined, page, pageSize: 10, sortBy, sortDesc });
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supplierApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["suppliers"] }); toast.success("Supplier deleted"); },
    onError: () => toast.error("Failed to delete supplier"),
  });

  const columns: Column<SupplierListDto>[] = [
    { key: "name", header: "Name", cell: (item) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-amber-500/10">
          <Building2 className="h-3.5 w-3.5 text-amber-400" />
        </div>
        <span className="font-medium text-white">{item.name}</span>
      </div>
    ), sortable: true },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "gstin", header: "GSTIN" },
    { key: "city", header: "City" },
    { key: "status", header: "Status", cell: (item) => <StatusBadge status={item.status} /> },
    { key: "actions", header: "", cell: (item) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/suppliers/${item.id}`)}><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/suppliers/${item.id}/edit`)}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => { if (confirm("Delete this supplier?")) deleteMutation.mutate(item.id); }}><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Suppliers</h2>
          <p className="text-surface-400 text-sm mt-1">Manage your vendor and supplier relationships</p>
        </div>
        <Button onClick={() => router.push("/suppliers/new")} variant="glow"><Plus className="h-4 w-4 mr-2" /> Add Supplier</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search suppliers..." className="w-full sm:w-64" />
            <Select options={statusOptions} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-36" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data?.items || []} isLoading={isLoading} page={page} pageSize={10}
            totalCount={data?.totalCount} onPageChange={setPage} onSort={(k, d) => { setSortBy(k); setSortDesc(d); }}
            sortBy={sortBy} sortDesc={sortDesc} onRowClick={(item) => router.push(`/suppliers/${item.id}`)}
            keyExtractor={(item) => item.id} emptyMessage="No suppliers found" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
