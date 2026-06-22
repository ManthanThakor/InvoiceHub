"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseOrderApi, productApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils/cn";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { UnitOfMeasure, type UpdatePurchaseOrderDto } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, X, Save, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";

interface LineItemForm {
  _tempId: string;
  productId: string;
  productName: string;
  hsnCode: string;
  orderedQty: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  gstRate: number;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
}

interface EditFormData {
  poDate: string;
  expectedDeliveryDate: string;
  isInterState: boolean;
  items: LineItemForm[];
  notes: string;
}

const defaultItem = (): LineItemForm => ({
  _tempId: crypto.randomUUID(),
  productId: "",
  productName: "",
  hsnCode: "",
  orderedQty: 1,
  unit: UnitOfMeasure.Pieces,
  unitPrice: 0,
  discountPercent: 0,
  gstRate: 18,
  taxableAmount: 0,
  gstAmount: 0,
  totalAmount: 0,
});

function calcItem(item: LineItemForm): LineItemForm {
  const qty = item.orderedQty || 0;
  const rate = item.unitPrice || 0;
  const discPct = item.discountPercent || 0;
  const lineTotal = qty * rate;
  const discAmt = (lineTotal * discPct) / 100;
  const taxable = lineTotal - discAmt;
  const gstRate = item.gstRate || 0;
  const gstAmt = (taxable * gstRate) / 100;
  return {
    ...item,
    taxableAmount: Math.round(taxable * 100) / 100,
    gstAmount: Math.round(gstAmt * 100) / 100,
    totalAmount: Math.round((taxable + gstAmt) * 100) / 100,
  };
}

export default function EditPurchaseOrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [productSearchIndex, setProductSearchIndex] = useState<number | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const debouncedProductSearch = useDebounce(productSearchTerm, 300);

  const { data: po, isLoading: loadingPO } = useQuery({
    queryKey: ["purchase-order", params.id],
    queryFn: async () => {
      const res = await purchaseOrderApi.getById(params.id);
      return res.data.data;
    },
    enabled: !!params.id,
  });

  const { data: productsData } = useQuery({
    queryKey: ["product-search", debouncedProductSearch],
    queryFn: async () => {
      if (!debouncedProductSearch) return { items: [] };
      const res = await productApi.search(debouncedProductSearch);
      return { items: res.data.data || [] };
    },
    enabled: debouncedProductSearch.length > 0,
  });

  const productSearchResults = productsData?.items || [];

  const [form, setForm] = useState<EditFormData>({
    poDate: "",
    expectedDeliveryDate: "",
    isInterState: false,
    items: [{ ...defaultItem() }],
    notes: "",
  });

  useEffect(() => {
    if (po) {
      setForm({
        poDate: po.poDate?.split("T")[0] || "",
        expectedDeliveryDate: po.expectedDeliveryDate?.split("T")[0] || "",
        isInterState: po.isInterState,
        items: po.items.map((item) => ({
          _tempId: crypto.randomUUID(),
          productId: item.productId,
          productName: item.productName,
          hsnCode: item.hsnCode,
          orderedQty: item.orderedQty,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          gstRate: item.gstRate,
          taxableAmount: item.taxableAmount,
          gstAmount: item.igstAmount || item.cgstAmount + item.sgstAmount,
          totalAmount: item.totalAmount,
        })),
        notes: po.notes || "",
      });
    }
  }, [po]);

  const [isSaving, setIsSaving] = useState(false);

  const updateForm = useCallback((patch: Partial<EditFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateItem = useCallback((index: number, patch: Partial<LineItemForm>) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = calcItem({ ...items[index], ...patch });
      return { ...prev, items };
    });
  }, []);

  const addItem = useCallback(() => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...defaultItem() }] }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }, []);

  const selectProduct = useCallback((index: number, product: any) => {
    setProductSearchIndex(null);
    setProductSearchTerm("");
    updateItem(index, {
      productId: product.value,
      productName: product.label,
      hsnCode: product.subLabel || "",
      unitPrice: 0,
      gstRate: 18,
    });
  }, [updateItem]);

  const calculatedSubTotal = form.items.reduce((sum, item) => sum + item.orderedQty * item.unitPrice, 0);
  const calculatedTaxable = form.items.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalGst = form.items.reduce((sum, item) => sum + item.gstAmount, 0);
  const grandTotal = Math.round((calculatedTaxable + totalGst) * 100) / 100;

  const handleSubmit = async () => {
    if (form.items.length === 0) { toast.error("Add at least one item"); return; }
    for (const item of form.items) {
      if (!item.productId) { toast.error("All items must have a product selected"); return; }
      if (!item.orderedQty || item.orderedQty <= 0) { toast.error("All items must have a valid quantity"); return; }
    }

    setIsSaving(true);
    try {
      const payload: UpdatePurchaseOrderDto = {
        poDate: form.poDate,
        expectedDeliveryDate: form.expectedDeliveryDate || undefined,
        isInterState: form.isInterState,
        items: form.items.map((item) => ({
          productId: item.productId,
          orderedQty: item.orderedQty,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
        })),
        notes: form.notes || undefined,
      };
      await purchaseOrderApi.update(params.id, payload);
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-order", params.id] });
      toast.success("Purchase order updated");
      router.push(`/purchase-orders/${params.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update purchase order");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingPO) return <PageLoading />;
  if (!po) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Purchase Order</h2>
            <p className="text-surface-400 text-sm mt-1">{po.poNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/30">
                <p className="text-sm font-medium text-white">{po.supplierName}</p>
                {po.supplierGSTIN && <p className="text-xs text-surface-400 mt-0.5">GSTIN: {po.supplierGSTIN}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="PO Date"
                  type="date"
                  value={form.poDate}
                  onChange={(e) => updateForm({ poDate: e.target.value })}
                />
                <Input
                  label="Expected Delivery Date"
                  type="date"
                  value={form.expectedDeliveryDate}
                  onChange={(e) => updateForm({ expectedDeliveryDate: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>Modify purchase order items</CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-700/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase w-8">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase">Product</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-400 uppercase w-20">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-400 uppercase w-28">Rate</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-400 uppercase w-20">Disc %</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-400 uppercase w-28">Taxable</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-400 uppercase w-20">GST</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-surface-400 uppercase w-28">Total</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-700/30">
                    {form.items.map((item, index) => (
                      <motion.tr
                        key={item._tempId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hover:bg-surface-800/30 transition-colors"
                      >
                        <td className="px-4 py-2 text-sm text-surface-400">{index + 1}</td>
                        <td className="px-4 py-2">
                          {item.productId ? (
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-sm font-medium text-white">{item.productName}</p>
                                <p className="text-xs text-surface-400">HSN: {item.hsnCode}</p>
                              </div>
                              <button onClick={() => updateItem(index, { productId: "", productName: "", hsnCode: "" })} className="text-surface-500 hover:text-red-400">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="text"
                                value={productSearchIndex === index ? productSearchTerm : ""}
                                onChange={(e) => { setProductSearchTerm(e.target.value); setProductSearchIndex(index); }}
                                onFocus={() => { setProductSearchTerm(""); setProductSearchIndex(index); }}
                                placeholder="Search product..."
                                className="w-full bg-transparent text-sm text-surface-100 placeholder:text-surface-500 border-b border-surface-700 focus:border-primary-500/50 outline-none py-1"
                              />
                              <AnimatePresence>
                                {productSearchIndex === index && productSearchResults.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute z-10 left-0 right-0 mt-1 rounded-xl glass-dark p-1 shadow-2xl border border-surface-700/50 max-h-48 overflow-y-auto"
                                  >
                                    {productSearchResults.map((p: any) => (
                                      <button
                                        key={p.value}
                                        onClick={() => selectProduct(index, p)}
                                        className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg hover:bg-surface-700/50 text-left transition-colors"
                                      >
                                        <span className="font-medium text-white">{p.label}</span>
                                        {p.subLabel && <span className="text-xs text-surface-400 ml-2">{p.subLabel}</span>}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.orderedQty || ""}
                            onChange={(e) => updateItem(index, { orderedQty: Number(e.target.value) })}
                            className="w-16 bg-transparent text-sm text-right text-white border-b border-surface-700 focus:border-primary-500/50 outline-none py-1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice || ""}
                            onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                            className="w-24 bg-transparent text-sm text-right text-white border-b border-surface-700 focus:border-primary-500/50 outline-none py-1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discountPercent || ""}
                            onChange={(e) => updateItem(index, { discountPercent: Number(e.target.value) })}
                            className="w-16 bg-transparent text-sm text-right text-white border-b border-surface-700 focus:border-primary-500/50 outline-none py-1"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-surface-200">
                          {formatCurrency(item.taxableAmount)}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-blue-400">
                          {formatCurrency(item.gstAmount)}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-medium text-white">
                          {formatCurrency(item.totalAmount)}
                        </td>
                        <td className="px-4 py-2">
                          {form.items.length > 1 && (
                            <button onClick={() => removeItem(index)} className="text-surface-500 hover:text-red-400 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-surface-700/50 px-4 py-4">
                <div className="flex justify-end">
                  <div className="w-full sm:w-72 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-400">Sub Total</span>
                      <span className="text-surface-200">{formatCurrency(calculatedSubTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-400">Taxable Amount</span>
                      <span className="text-surface-200">{formatCurrency(calculatedTaxable)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-400">Total GST</span>
                      <span className="text-blue-400">{formatCurrency(totalGst)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-700/50">
                      <span className="text-white">Grand Total</span>
                      <span className="text-white">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={form.notes}
                onChange={(e) => updateForm({ notes: e.target.value })}
                rows={3}
                className="flex w-full rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 resize-none"
                placeholder="Additional notes..."
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supply Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Supply Type"
                value={form.isInterState ? "inter" : "intra"}
                onChange={(e) => updateForm({ isInterState: e.target.value === "inter" })}
                options={[
                  { value: "intra", label: "Intra-State (CGST+SGST)" },
                  { value: "inter", label: "Inter-State (IGST)" },
                ]}
              />
              {form.isInterState ? (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs font-medium text-blue-400">Inter-State Supply</p>
                  <p className="text-xs text-blue-300 mt-0.5">IGST will be applied</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs font-medium text-emerald-400">Intra-State Supply</p>
                  <p className="text-xs text-emerald-300 mt-0.5">CGST + SGST will be applied</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/5 border border-primary-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-500/20">
                      <IndianRupee className="h-6 w-6 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-xs text-surface-400">Grand Total</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(grandTotal)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-primary-500/10 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-surface-400">Items</span>
                    <span className="text-surface-200">{form.items.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-surface-400">Taxable</span>
                    <span className="text-surface-200">{formatCurrency(calculatedTaxable)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-surface-400">GST</span>
                    <span className="text-blue-400">{formatCurrency(totalGst)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" variant="glow" onClick={handleSubmit} isLoading={isSaving}>
            <Save className="h-4 w-4 mr-2" /> Update PO
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
