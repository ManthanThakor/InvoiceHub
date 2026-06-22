"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { customerApi, invoiceApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { InvoiceListDto } from "@/types";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, DollarSign } from "lucide-react";
import { PageLoading } from "@/components/ui/loading";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => { const res = await customerApi.getById(id); return res.data.data; },
  });

  const { data: invoices } = useQuery({
    queryKey: ["customer-invoices", id],
    queryFn: async () => { const res = await invoiceApi.list({ customerId: id, pageSize: 5 }); return res.data.data; },
  });

  if (isLoading) return <PageLoading />;

  const invColumns: Column<InvoiceListDto>[] = [
    { key: "invoiceNumber", header: "Invoice #", cell: (item) => <span className="font-medium text-white">{item.invoiceNumber}</span> },
    { key: "invoiceDate", header: "Date", cell: (item) => formatDate(item.invoiceDate) },
    { key: "grandTotal", header: "Amount", cell: (item) => <span className="font-semibold">{formatCurrency(item.grandTotal)}</span> },
    { key: "status", header: "Status", cell: (item) => <StatusBadge status={item.status} /> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/customers")}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">{customer?.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={customer?.status || ""} />
            <StatusBadge status={customer?.customerType || ""} />
          </div>
        </div>
        <Button onClick={() => router.push(`/customers/${id}/edit`)}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {customer?.email && <div className="flex items-center gap-3 text-surface-300"><Mail className="h-4 w-4 text-surface-400" />{customer.email}</div>}
            {customer?.phone && <div className="flex items-center gap-3 text-surface-300"><Phone className="h-4 w-4 text-surface-400" />{customer.phone}</div>}
            {customer?.billingAddress && <div className="flex items-start gap-3 text-surface-300"><MapPin className="h-4 w-4 text-surface-400 mt-0.5" />{customer.billingAddress.line1}, {customer.billingAddress.city ?? ""}, {customer.billingAddress.state ?? ""} - {customer.billingAddress.pinCode ?? ""}</div>}
            {customer?.gstin && <div className="text-sm"><span className="text-surface-400">GSTIN:</span> <span className="text-surface-200">{customer.gstin}</span></div>}
            {customer?.pan && <div className="text-sm"><span className="text-surface-400">PAN:</span> <span className="text-surface-200">{customer.pan}</span></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-xs text-surface-400 uppercase">Total Revenue</p><p className="text-xl font-bold text-white">{formatCurrency((invoices?.items ?? []).reduce((s, i) => s + i.grandTotal, 0))}</p></div>
            <div><p className="text-xs text-surface-400 uppercase">Total Invoices</p><p className="text-xl font-bold text-white">{invoices?.totalCount || 0}</p></div>
            <div><p className="text-xs text-surface-400 uppercase">Outstanding</p><p className="text-xl font-bold text-red-400">{formatCurrency((invoices?.items ?? []).reduce((s, i) => s + i.balanceDue, 0))}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Invoices</CardTitle></CardHeader>
        <CardContent className="p-0">
          <DataTable columns={invColumns} data={invoices?.items || []} keyExtractor={(item) => item.id}
            onRowClick={(item) => router.push(`/invoices/${item.id}`)} emptyMessage="No invoices for this customer" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
