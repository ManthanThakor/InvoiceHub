"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { expenseApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency, formatDate } from "@/lib/utils/cn";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Calendar, Tag, Building2, CreditCard, Receipt, FileText, Download, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

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

export default function ExpenseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: expense, isLoading } = useQuery({
    queryKey: ["expense", params.id],
    queryFn: async () => {
      const res = await expenseApi.getById(params.id);
      return res.data.data;
    },
    enabled: !!params.id,
  });

  if (isLoading) return <PageLoading />;
  if (!expense) return null;

  const handleDownloadReceipt = async () => {
    if (!expense.receiptUrl) return;
    try {
      window.open(expense.receiptUrl, "_blank");
    } catch {
      toast.error("Failed to open receipt");
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{expense.title}</h2>
              <StatusBadge status={expense.category} />
            </div>
            <p className="text-surface-400 text-sm mt-0.5">Created {formatDate(expense.createdAt, "long")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => router.push(`/expenses/${expense.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemAnim} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Expense Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DetailRow icon={<Calendar className="h-4 w-4" />} label="Date" value={formatDate(expense.expenseDate, "long")} />
              <DetailRow icon={<Tag className="h-4 w-4" />} label="Category" value={<StatusBadge status={expense.category} />} />
              <DetailRow icon={<CreditCard className="h-4 w-4" />} label="Payment Method" value={expense.paymentMethod} />
              {expense.vendorName && <DetailRow icon={<Building2 className="h-4 w-4" />} label="Vendor" value={expense.vendorName} />}
              {expense.referenceNumber && <DetailRow icon={<FileText className="h-4 w-4" />} label="Reference" value={expense.referenceNumber} />}
              {expense.notes && (
                <div className="col-span-2">
                  <DetailRow icon={<FileText className="h-4 w-4" />} label="Notes" value={<p className="whitespace-pre-wrap text-surface-300">{expense.notes}</p>} />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemAnim} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Amount</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Receipt className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-400">Total Amount</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(expense.totalAmount)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-red-500/10 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-surface-400">Base Amount</span>
                    <span className="text-surface-200">{formatCurrency(expense.amount)}</span>
                  </div>
                  {expense.gstAmount ? (
                    <div className="flex justify-between text-xs">
                      <span className="text-surface-400">GST</span>
                      <span className="text-blue-400">{formatCurrency(expense.gstAmount)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {expense.receiptUrl && (
            <Card>
              <CardHeader><CardTitle>Receipt</CardTitle></CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full" onClick={handleDownloadReceipt}>
                  <ExternalLink className="h-4 w-4 mr-2" /> View Receipt
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
