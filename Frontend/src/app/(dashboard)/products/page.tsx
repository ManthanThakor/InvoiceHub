"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { productApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";
import { ProductListDto, ProductType } from "@/types";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, Package } from "lucide-react";
import toast from "react-hot-toast";

const typeOptions = [{ value: "", label: "All Types" }, ...Object.values(ProductType).map((t) => ({ value: t, label: t }))];

const stockFilterOptions = [
  { value: "", label: "All Stock" },
  { value: "low", label: "Low Stock" },
  { value: "out", label: "Out of Stock" },
];

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDesc, setSortDesc] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["products", { search, type, stockFilter, page, sortBy, sortDesc }],
    queryFn: async () => {
      const res = await productApi.list({
        search: search || undefined,
        type: type ? (type as ProductType) : undefined,
        lowStockOnly: stockFilter === "low" ? true : undefined,
        page, pageSize: 10, sortBy, sortDesc,
      });
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); toast.success("Product deleted"); },
    onError: () => toast.error("Failed to delete product"),
  });

  const columns: Column<ProductListDto>[] = [
    { key: "name", header: "Name", cell: (item) => (
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400">
          <Package className="h-4 w-4" />
        </div>
        <span className="font-medium text-white">{item.name}</span>
      </div>
    ), sortable: true },
    { key: "sku", header: "SKU", cell: (item) => <span className="text-surface-400 font-mono text-xs">{item.sku}</span> },
    { key: "hsnCode", header: "HSN" },
    { key: "productType", header: "Type", cell: (item) => <StatusBadge status={item.productType} /> },
    { key: "salePrice", header: "Price", cell: (item) => <span className="font-semibold">{formatCurrency(item.salePrice)}</span>, sortable: true },
    { key: "gstRate", header: "GST %", cell: (item) => <span>{item.gstRate}%</span> },
    { key: "currentStock", header: "Stock", cell: (item) => (
      <span className={item.isLowStock ? "text-red-400 font-medium" : "text-emerald-400"}>{item.currentStock}</span>
    ), sortable: true },
    { key: "minimumStock", header: "Min Stock", cell: (item) => <span className="text-surface-400">{item.minimumStock}</span> },
    { key: "isActive", header: "Status", cell: (item) => <StatusBadge status={item.isActive ? "Active" : "Inactive"} /> },
    { key: "actions", header: "", cell: (item) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/products/${item.id}`)}><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/products/${item.id}/edit`)}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(item.id); }}><Trash2 className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Products</h2>
          <p className="text-surface-400 text-sm mt-1">Manage your product catalog and inventory</p>
        </div>
        <Button onClick={() => router.push("/products/new")} variant="glow"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." className="w-full sm:w-64" />
            <Select options={typeOptions} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-32" />
            <Select options={stockFilterOptions} value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} className="w-32" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data?.items || []} isLoading={isLoading} page={page} pageSize={10}
            totalCount={data?.totalCount} onPageChange={setPage} onSort={(k, d) => { setSortBy(k); setSortDesc(d); }}
            sortBy={sortBy} sortDesc={sortDesc} onRowClick={(item) => router.push(`/products/${item.id}`)}
            keyExtractor={(item) => item.id} emptyMessage="No products found" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
