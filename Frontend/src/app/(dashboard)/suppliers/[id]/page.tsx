"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supplierApi, purchaseOrderApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { PurchaseOrderListDto } from "@/types";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Building2, CreditCard, Banknote, Globe, User } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: supplier, isLoading } = useQuery({
    queryKey: ["supplier", params.id],
    queryFn: async () => { const res = await supplierApi.getById(params.id); return res.data.data; },
    enabled: !!params.id,
  });

  const { data: purchaseOrders } = useQuery({
    queryKey: ["supplier-pos", params.id],
    queryFn: async () => { const res = await purchaseOrderApi.list({ supplierId: params.id, pageSize: 5 }); return res.data.data; },
    enabled: !!params.id,
  });

  if (isLoading) return <PageLoading />;
  if (!supplier) return null;

  const poColumns: Column<PurchaseOrderListDto>[] = [
    { key: "poNumber", header: "PO #", cell: (item) => <span className="font-medium text-white">{item.poNumber}</span> },
    { key: "poDate", header: "Date", cell: (item) => formatDate(item.poDate) },
    { key: "grandTotal", header: "Amount", cell: (item) => <span className="font-semibold">{formatCurrency(item.grandTotal)}</span> },
    { key: "status", header: "Status", cell: (item) => <StatusBadge status={item.status} /> },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemAnim} className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/suppliers")}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{supplier.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={supplier.status} />
          </div>
        </div>
        <Button onClick={() => router.push(`/suppliers/${params.id}/edit`)}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemAnim} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {supplier.email && <div className="flex items-center gap-3 text-surface-300"><Mail className="h-4 w-4 text-surface-400" />{supplier.email}</div>}
              {supplier.phone && <div className="flex items-center gap-3 text-surface-300"><Phone className="h-4 w-4 text-surface-400" />{supplier.phone}</div>}
              {supplier.contactPerson && <div className="flex items-center gap-3 text-surface-300"><User className="h-4 w-4 text-surface-400" />{supplier.contactPerson}</div>}
              {supplier.address && (
                <div className="flex items-start gap-3 text-surface-300">
                  <MapPin className="h-4 w-4 text-surface-400 mt-0.5" />
                  {supplier.address.line1}, {supplier.address.city ?? ""}, {supplier.address.state ?? ""} - {supplier.address.pinCode ?? ""}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {supplier.gstin && <div className="text-sm"><span className="text-surface-400">GSTIN:</span> <span className="text-surface-200">{supplier.gstin}</span></div>}
                {supplier.pan && <div className="text-sm"><span className="text-surface-400">PAN:</span> <span className="text-surface-200">{supplier.pan}</span></div>}
                {supplier.paymentTermDays && <div className="text-sm"><span className="text-surface-400">Payment Terms:</span> <span className="text-surface-200">{supplier.paymentTermDays} days</span></div>}
              </div>
            </CardContent>
          </Card>

          {(supplier.bankName || supplier.bankAccountNumber) && (
            <Card>
              <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {supplier.bankName && <div className="flex items-center gap-3 text-surface-300"><Building2 className="h-4 w-4 text-surface-400" />{supplier.bankName}</div>}
                {supplier.bankAccountNumber && <div className="flex items-center gap-3 text-surface-300"><CreditCard className="h-4 w-4 text-surface-400" />{supplier.bankAccountNumber}</div>}
                {supplier.bankIFSC && <div className="flex items-center gap-3 text-surface-300"><Globe className="h-4 w-4 text-surface-400" />IFSC: {supplier.bankIFSC}</div>}
              </CardContent>
            </Card>
          )}

          {supplier.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-surface-300 whitespace-pre-wrap">{supplier.notes}</p></CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div variants={itemAnim} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-xs text-surface-400 uppercase">Total Purchase Orders</p><p className="text-xl font-bold text-white">{purchaseOrders?.totalCount || 0}</p></div>
              <div><p className="text-xs text-surface-400 uppercase">Total Purchases</p><p className="text-xl font-bold text-white">{formatCurrency((purchaseOrders?.items ?? []).reduce((s, i) => s + i.grandTotal, 0))}</p></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemAnim}>
        <Card>
          <CardHeader><CardTitle>Recent Purchase Orders</CardTitle></CardHeader>
          <CardContent className="p-0">
            <DataTable columns={poColumns} data={purchaseOrders?.items || []} keyExtractor={(item) => item.id}
              onRowClick={(item) => router.push(`/purchase-orders/${item.id}`)} emptyMessage="No purchase orders for this supplier" />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}


