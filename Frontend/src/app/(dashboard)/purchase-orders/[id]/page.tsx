"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseOrderApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency, formatDate, downloadBlob } from "@/lib/utils/cn";
import { PurchaseOrderStatus, PaymentStatus } from "@/types";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Edit, Building2, Calendar, ClipboardList, IndianRupee, Banknote, Package, CheckCircle, XCircle, Receipt } from "lucide-react";
import toast from "react-hot-toast";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: po, isLoading } = useQuery({
    queryKey: ["purchase-order", params.id],
    queryFn: async () => {
      const res = await purchaseOrderApi.getById(params.id);
      return res.data.data;
    },
    enabled: !!params.id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => purchaseOrderApi.cancel(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-order", params.id] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order cancelled");
    },
    onError: () => toast.error("Failed to cancel purchase order"),
  });

  const markReceivedMutation = useMutation({
    mutationFn: () => purchaseOrderApi.markReceived(params.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-order", params.id] });
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success("Purchase order marked as received");
    },
    onError: () => toast.error("Failed to mark as received"),
  });

  if (isLoading) return <PageLoading />;
  if (!po) return null;

  const canEdit = po.status === PurchaseOrderStatus.Draft;
  const canCancel = po.status === PurchaseOrderStatus.Draft || po.status === PurchaseOrderStatus.Ordered;
  const canReceive = po.status === PurchaseOrderStatus.Ordered || po.status === PurchaseOrderStatus.PartiallyReceived;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{po.poNumber}</h2>
              <StatusBadge status={po.status} />
            </div>
            <p className="text-surface-400 text-sm mt-0.5">Created {formatDate(po.createdAt, "long")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && (
            <Button variant="secondary" onClick={() => router.push(`/purchase-orders/${po.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}
          {canReceive && (
            <Button variant="success" onClick={() => markReceivedMutation.mutate()} isLoading={markReceivedMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" /> Mark Received
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" onClick={() => cancelMutation.mutate()} isLoading={cancelMutation.isPending}>
              <XCircle className="h-4 w-4 mr-2" /> Cancel
            </Button>
          )}
          <Button variant="secondary" onClick={() => purchaseOrderApi.downloadPdf(po.id).then(r => downloadBlob(new Blob([r.data], { type: "application/pdf" }), `PO-${po.poNumber || po.id}.pdf`))}>
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemAnim} className="lg:col-span-2 space-y-6">

          <div className="rounded-xl border border-surface-700/30 bg-surface-800/50 backdrop-blur-sm overflow-hidden">
            <div className="border-b border-surface-700/30 bg-gradient-to-r from-primary-500/5 to-transparent px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/10">
                    <ClipboardList className="h-5 w-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-surface-300">Purchase Order</h3>
                    <p className="text-lg font-bold text-white">{po.poNumber}</p>
                  </div>
                </div>
                <StatusBadge status={po.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-surface-700/20">
              <div className="bg-surface-800/80 px-6 py-4">
                <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-1">PO Date</p>
                <p className="text-sm font-medium text-white">{formatDate(po.poDate, "long")}</p>
              </div>
              <div className="bg-surface-800/80 px-6 py-4">
                <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-1">Supplier</p>
                <p className="text-sm font-medium text-white">{po.supplierName}</p>
              </div>
              <div className="bg-surface-800/80 px-6 py-4">
                <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-1">Expected Delivery</p>
                <p className="text-sm font-medium text-white">{po.expectedDeliveryDate ? formatDate(po.expectedDeliveryDate, "long") : "—"}</p>
              </div>
              <div className="bg-surface-800/80 px-6 py-4">
                <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest mb-1">Supply Type</p>
                <p className="text-sm font-medium text-white">{po.isInterState ? "Inter-State" : "Intra-State"}</p>
              </div>
            </div>

            {(po.supplierGSTIN || po.receivedDate) && (
              <div className="border-t border-surface-700/30 px-6 py-3 flex flex-wrap gap-x-8 gap-y-2">
                {po.supplierGSTIN && (
                  <div>
                    <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Supplier GSTIN</p>
                    <p className="text-sm font-medium text-white">{po.supplierGSTIN}</p>
                  </div>
                )}
                {po.receivedDate && (
                  <div>
                    <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Received Date</p>
                    <p className="text-sm font-medium text-white">{formatDate(po.receivedDate, "long")}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>{po.items?.length || 0} line item(s)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-700/50 bg-surface-800/50">
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-surface-500 uppercase tracking-widest">#</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Item</th>
                      <th className="px-5 py-3 text-left text-[10px] font-semibold text-surface-500 uppercase tracking-widest">HSN</th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Ordered</th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Received</th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Rate</th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Disc%</th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Taxable</th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold text-surface-500 uppercase tracking-widest">GST</th>
                      <th className="px-5 py-3 text-right text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/20">
                    {(po.items ?? []).map((item, i) => (
                      <motion.tr
                        key={item.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`transition-colors ${i % 2 === 0 ? 'bg-surface-900/30' : 'bg-surface-800/30'} hover:bg-surface-700/30`}
                      >
                        <td className="px-5 py-3.5 text-sm text-surface-400 w-8">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-white">{item.productName}</p>
                          {item.description && <p className="text-xs text-surface-500 mt-0.5">{item.description}</p>}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-surface-400 font-mono">{item.hsnCode}</td>
                        <td className="px-5 py-3.5 text-sm text-right text-surface-200">{item.orderedQty} <span className="text-surface-500">{item.unit}</span></td>
                        <td className="px-5 py-3.5 text-sm text-right">
                          <span className={`inline-flex items-center gap-1 ${item.receivedQty >= item.orderedQty ? "text-emerald-400" : item.receivedQty > 0 ? "text-amber-400" : "text-surface-500"}`}>
                            {item.receivedQty >= item.orderedQty ? <CheckCircle className="h-3 w-3" /> : null}
                            {item.receivedQty} <span className="text-surface-500">{item.unit}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-right text-surface-200">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-5 py-3.5 text-sm text-right text-surface-400">{item.discountPercent > 0 ? `${item.discountPercent}%` : "—"}</td>
                        <td className="px-5 py-3.5 text-sm text-right text-surface-200">{formatCurrency(item.taxableAmount)}</td>
                        <td className="px-5 py-3.5 text-sm text-right">
                          <span className="text-blue-400 text-xs font-medium">
                            {po.isInterState ? `IGST` : `CGST+SGST`}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-right font-semibold text-white">{formatCurrency(item.totalAmount)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-surface-700/50 bg-surface-800/30 px-5 py-4">
                <div className="flex justify-end">
                  <div className="w-full sm:w-72 space-y-1.5">
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-surface-400">Sub Total</span>
                      <span className="text-surface-200">{formatCurrency(po.subTotal)}</span>
                    </div>
                    {po.discountAmount > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-surface-400">Discount</span>
                        <span className="text-red-400">-{formatCurrency(po.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-surface-400">Taxable Amount</span>
                      <span className="text-surface-200">{formatCurrency(po.taxableAmount)}</span>
                    </div>
                    {po.igstAmount > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-surface-400">IGST</span>
                        <span className="text-blue-400">{formatCurrency(po.igstAmount)}</span>
                      </div>
                    )}
                    {po.cgstAmount > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-surface-400">CGST</span>
                        <span className="text-emerald-400">{formatCurrency(po.cgstAmount)}</span>
                      </div>
                    )}
                    {po.sgstAmount > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-surface-400">SGST</span>
                        <span className="text-emerald-400">{formatCurrency(po.sgstAmount)}</span>
                      </div>
                    )}
                    {po.cessAmount > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-surface-400">Cess</span>
                        <span className="text-surface-200">{formatCurrency(po.cessAmount)}</span>
                      </div>
                    )}
                    {po.roundOff !== 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-surface-400">Round Off</span>
                        <span className="text-surface-300">{formatCurrency(po.roundOff)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-3 mt-2 border-t-2 border-surface-600/50">
                      <span className="text-white">Grand Total</span>
                      <span className="text-white text-lg">{formatCurrency(po.grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-1">
                      <span className="text-surface-400">Paid</span>
                      <span className="text-emerald-400 font-medium">{formatCurrency(po.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-surface-300">Balance Due</span>
                      <span className={po.balanceDue > 0 ? "text-red-400" : "text-emerald-400"}>{formatCurrency(po.balanceDue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {po.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-surface-300 whitespace-pre-wrap">{po.notes}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div variants={itemAnim} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary-400" />
                <CardTitle>Payment Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15">
                    <Banknote className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Total</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(po.grandTotal)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15">
                    <Banknote className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Paid</p>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(po.paidAmount)}</p>
                  </div>
                </div>
              </div>
              {po.balanceDue > 0 ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/15">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/15">
                      <IndianRupee className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Balance Due</p>
                      <p className="text-lg font-bold text-red-400">{formatCurrency(po.balanceDue)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/15">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-widest">Status</p>
                      <p className="text-base font-bold text-emerald-400">Fully Paid</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-400" />
                <CardTitle>Supplier</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/15">
                <div className="p-2.5 rounded-lg bg-amber-500/15">
                  <Building2 className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{po.supplierName}</p>
                  {po.supplierGSTIN && <p className="text-xs text-surface-400 mt-0.5">GSTIN: {po.supplierGSTIN}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {po.payments && po.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>{po.payments.length} payment(s) recorded</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-surface-700/30">
                  {po.payments.map((payment, i) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-3 hover:bg-surface-800/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">{payment.paymentNumber}</p>
                          <p className="text-xs text-surface-400">{formatDate(payment.paymentDate, "long")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-400">{formatCurrency(payment.amount)}</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                            payment.status === PaymentStatus.Completed
                              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                              : payment.status === PaymentStatus.Failed
                              ? "text-red-400 bg-red-400/10 border-red-400/20"
                              : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-surface-500 bg-surface-800/50 px-1.5 py-0.5 rounded">{payment.method}</span>
                        {payment.referenceNumber && (
                          <span className="text-[10px] text-surface-500">Ref: {payment.referenceNumber}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
