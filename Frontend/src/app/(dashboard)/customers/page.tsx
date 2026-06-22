"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { customerApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { CustomerListDto, CustomerType, CustomerStatus } from "@/types";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";

const typeOptions = [{ value: "", label: "All Types" }, ...Object.values(CustomerType).map((t) => ({ value: t, label: t }))];
const statusOptions = [{ value: "", label: "All Statuses" }, ...Object.values(CustomerStatus).map((s) => ({ value: s, label: s }))];

export default function CustomersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", { search, type, status, page, sortBy, sortDesc }],
    queryFn: async () => {
      const res = await customerApi.list({ search: search || undefined, type: type ? (type as CustomerType) : undefined, status: status ? (status as CustomerStatus) : undefined, page, pageSize: 10, sortBy, sortDesc });
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); toast.success("Customer deleted"); },
    onError: () => toast.error("Failed to delete customer"),
  });

  const columns: Column<CustomerListDto>[] = [
    { key: "name", header: "Name", cell: (item) => <span className="font-medium text-white">{item.name}</span>, sortable: true },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "customerType", header: "Type", cell: (item) => <StatusBadge status={item.customerType} /> },
    { key: "status", header: "Status", cell: (item) => <StatusBadge status={item.status} /> },
    { key: "outstandingBalance", header: "Outstanding", cell: (item) => <span className={item.outstandingBalance > 0 ? "text-red-400 font-medium" : "text-emerald-400"}>{formatCurrency(item.outstandingBalance)}</span>, sortable: true },
    { key: "billingCity", header: "City" },
    { key: "createdAt", header: "Created", cell: (item) => formatDate(item.createdAt), sortable: true },
    { key: "actions", header: "", cell: (item) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/customers/${item.id}`)}><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/customers/${item.id}/edit`)}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => { if (confirm("Delete this customer?")) deleteMutation.mutate(item.id); }}><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Customers</h2>
          <p className="text-surface-400 text-sm mt-1">Manage your customer base</p>
        </div>
        <Button onClick={() => router.push("/customers/new")} variant="glow"><Plus className="h-4 w-4 mr-2" /> Add Customer</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customers..." className="w-full sm:w-64" />
            <Select options={typeOptions} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-36" />
            <Select options={statusOptions} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-36" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data?.items || []} isLoading={isLoading} page={page} pageSize={10}
            totalCount={data?.totalCount} onPageChange={setPage} onSort={(k, d) => { setSortBy(k); setSortDesc(d); }}
            sortBy={sortBy} sortDesc={sortDesc} onRowClick={(item) => router.push(`/customers/${item.id}`)}
            keyExtractor={(item) => item.id} emptyMessage="No customers found" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
