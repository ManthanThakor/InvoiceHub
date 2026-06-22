"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { paymentApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Building2, CreditCard, FileText, Hash, Banknote, User, Receipt } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-surface-800/50 text-surface-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs font-medium text-surface-400 uppercase tracking-wider">{label}</p>
        <div className="text-sm font-medium text-white mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export default function PaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: payment, isLoading } = useQuery({
    queryKey: ["payment", params.id],
    queryFn: async () => {
      const res = await paymentApi.getById(params.id);
      return res.data.data;
    },
    enabled: !!params.id,
  });

  if (isLoading) return <PageLoading />;
  if (!payment) return null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemAnim} className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{payment.paymentNumber}</h2>
            <StatusBadge status={payment.status} />
          </div>
          <p className="text-surface-400 text-sm mt-0.5">Created {formatDate(payment.createdAt, "long")}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemAnim} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DetailRow icon={<Calendar className="h-4 w-4" />} label="Payment Date" value={formatDate(payment.paymentDate, "long")} />
              <DetailRow icon={<CreditCard className="h-4 w-4" />} label="Method" value={payment.method} />
              <DetailRow icon={<StatusBadge status={payment.status} />} label="Status" value={<StatusBadge status={payment.status} />} />
              {payment.customerName && <DetailRow icon={<User className="h-4 w-4" />} label="Customer" value={payment.customerName} />}
              {payment.invoiceNumber && <DetailRow icon={<Receipt className="h-4 w-4" />} label="Invoice" value={payment.invoiceNumber} />}
              {payment.referenceNumber && <DetailRow icon={<Hash className="h-4 w-4" />} label="Reference" value={payment.referenceNumber} />}
              {payment.bankName && <DetailRow icon={<Building2 className="h-4 w-4" />} label="Bank" value={payment.bankName} />}
              {payment.notes && (
                <div className="col-span-2">
                  <DetailRow icon={<FileText className="h-4 w-4" />} label="Notes" value={<p className="whitespace-pre-wrap text-surface-300">{payment.notes}</p>} />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Amount</CardTitle></CardHeader>
            <CardContent>
              <div className={`p-4 rounded-xl border ${payment.isRefund ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${payment.isRefund ? "bg-red-500/20" : "bg-emerald-500/20"}`}>
                    <Banknote className={`h-6 w-6 ${payment.isRefund ? "text-red-400" : "text-emerald-400"}`} />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400">{payment.isRefund ? "Refund Amount" : "Payment Amount"}</p>
                    <p className={`text-2xl font-bold ${payment.isRefund ? "text-red-400" : "text-white"}`}>
                      {payment.isRefund ? "-" : ""}{formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {(payment.customerId || payment.invoiceId) && (
            <Card>
              <CardHeader><CardTitle>Related</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {payment.customerId && (
                  <Button variant="secondary" className="w-full justify-start" onClick={() => router.push(`/customers/${payment.customerId}`)}>
                    <User className="h-4 w-4 mr-2" /> View Customer
                  </Button>
                )}
                {payment.invoiceId && (
                  <Button variant="secondary" className="w-full justify-start" onClick={() => router.push(`/invoices/${payment.invoiceId}`)}>
                    <Receipt className="h-4 w-4 mr-2" /> View Invoice
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
