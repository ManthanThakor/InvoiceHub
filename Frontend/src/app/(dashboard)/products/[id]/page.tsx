"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { productApi, inventoryApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { InventoryMovementDto } from "@/types";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Package, Tag, Barcode, DollarSign, Layers, AlertTriangle, Archive, Activity } from "lucide-react";
import { PageLoading } from "@/components/ui/loading";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => { const res = await productApi.getById(id); return res.data.data; },
  });

  const { data: movements } = useQuery({
    queryKey: ["product-movements", id],
    queryFn: async () => { const res = await inventoryApi.movements({ productId: id, pageSize: 5 }); return res.data.data; },
  });

  if (isLoading) return <PageLoading />;

  const movColumns: Column<InventoryMovementDto>[] = [
    { key: "createdAt", header: "Date", cell: (item) => formatDate(item.createdAt) },
    { key: "movementType", header: "Type", cell: (item) => <StatusBadge status={item.movementType} /> },
    { key: "quantity", header: "Qty", cell: (item) => (
      <span className={item.quantity > 0 ? "text-emerald-400" : "text-red-400"}>{item.quantity > 0 ? `+${item.quantity}` : item.quantity}</span>
    )},
    { key: "stockAfter", header: "Balance", cell: (item) => <span className="font-medium">{item.stockAfter}</span> },
    { key: "notes", header: "Notes", cell: (item) => item.notes || "-" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/products")}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{product?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={product?.isActive ? "Active" : "Inactive"} />
                <StatusBadge status={product?.productType || ""} />
                <span className="text-xs font-mono text-surface-500">{product?.sku}</span>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={() => router.push(`/products/${id}/edit`)}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {product?.description && (
                <div className="col-span-2">
                  <p className="text-xs text-surface-400 uppercase mb-1">Description</p>
                  <p className="text-sm text-surface-200">{product.description}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-surface-400 uppercase mb-1">HSN Code</p>
                <p className="text-sm font-mono text-surface-200">{product?.hsnCode}</p>
              </div>
              <div>
                <p className="text-xs text-surface-400 uppercase mb-1">Unit</p>
                <p className="text-sm text-surface-200">{product?.unit}</p>
              </div>
              {product?.barcode && (
                <div>
                  <p className="text-xs text-surface-400 uppercase mb-1">Barcode</p>
                  <p className="text-sm font-mono text-surface-200">{product.barcode}</p>
                </div>
              )}
              {product?.categoryName && (
                <div>
                  <p className="text-xs text-surface-400 uppercase mb-1">Category</p>
                  <p className="text-sm text-surface-200">{product.categoryName}</p>
                </div>
              )}
              {product?.storageLocation && (
                <div>
                  <p className="text-xs text-surface-400 uppercase mb-1">Storage Location</p>
                  <p className="text-sm text-surface-200">{product.storageLocation}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-surface-400 uppercase">Sale Price</p>
              <p className="text-lg font-bold text-white">{formatCurrency(product?.salePrice || 0)}</p>
            </div>
            <div className="h-px bg-surface-700/50" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-surface-400 uppercase">Purchase Price</p>
              <p className="text-sm font-medium text-surface-200">{formatCurrency(product?.purchasePrice || 0)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-surface-400 uppercase">MRP</p>
              <p className="text-sm text-surface-300">{product?.mrp ? formatCurrency(product.mrp) : "-"}</p>
            </div>
            <div className="h-px bg-surface-700/50" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-surface-400 uppercase">GST Rate</p>
              <p className="text-sm font-medium text-surface-200">{product?.gstRate}%</p>
            </div>
            {product?.cessRate ? (
              <div className="flex items-center justify-between">
                <p className="text-xs text-surface-400 uppercase">Cess</p>
                <p className="text-sm text-surface-200">{product.cessRate}%</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card glass>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-surface-400 uppercase">Current Stock</p>
              <p className={`text-lg font-bold ${product && product.currentStock <= product.minimumStock ? "text-red-400" : "text-white"}`}>
                {product?.currentStock ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-surface-400 uppercase">Min Stock Level</p>
              <p className="text-lg font-bold text-white">{product?.minimumStock ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-surface-400 uppercase">Reorder Qty</p>
              <p className="text-lg font-bold text-white">{product?.reorderQty ?? "-"}</p>
            </div>
          </CardContent>
        </Card>
        <Card glass>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-surface-400 uppercase">Stock Value</p>
              <p className="text-lg font-bold text-white">{formatCurrency((product?.currentStock || 0) * (product?.purchasePrice || 0))}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Inventory Movements</CardTitle><CardDescription>Recent stock changes</CardDescription></CardHeader>
        <CardContent className="p-0">
          <DataTable columns={movColumns} data={movements?.items || []} keyExtractor={(item) => item.id}
            emptyMessage="No inventory movements recorded" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
