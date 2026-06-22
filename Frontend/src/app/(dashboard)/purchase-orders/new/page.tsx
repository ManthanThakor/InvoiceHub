"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseOrderApi, supplierApi, productApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { UnitOfMeasure, type CreatePurchaseOrderDto } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Search, X, Save, Send, IndianRupee } from "lucide-react";
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

interface POFormData {
  supplierId: string;
  supplierName: string;
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

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [productSearchIndex, setProductSearchIndex] = useState<number | null>(null);
  const debouncedSupplierSearch = useDebounce(supplierSearch, 300);

  const { data: suppliersData } = useQuery({
    queryKey: ["supplier-search", debouncedSupplierSearch],
    queryFn: async () => {
      if (!debouncedSupplierSearch) return { items: [] };
      const res = await supplierApi.search(debouncedSupplierSearch);
      return { items: res.data.data || [] };
    },
    enabled: debouncedSupplierSearch.length > 0,
  });

  const supplierSearchResults = suppliersData?.items || [];

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const debouncedProductSearch = useDebounce(productSearchTerm, 300);

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

  const [form, setForm] = useState<POFormData>({
    supplierId: "",
    supplierName: "",
    poDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
    isInterState: false,
    items: [{ ...defaultItem() }],
    notes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const updateForm = useCallback((patch: Partial<POFormData>) => {
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

  const selectSupplier = useCallback((s: any) => {
    updateForm({ supplierId: s.value, supplierName: s.label });
    setShowSupplierDropdown(false);
    setSupplierSearch(s.label);
  }, [updateForm]);

  const selectProduct = useCallback((index: number, product: any) => {
    setProductSearchIndex(null);
    setProductSearchTerm("");
    const sub = product.subLabel || "";
    const priceMatch = sub.match(/₹([\d,]+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : 0;
    const gstMatch = sub.match(/GST\s*([\d.]+)%/);
    const gstRate = gstMatch ? parseFloat(gstMatch[1]) : 18;
    updateItem(index, {
      productId: product.value,
      productName: product.label,
      hsnCode: sub,
      unitPrice: price,
      gstRate,
    });
  }, [updateItem]);

  const calculatedSubTotal = form.items.reduce((sum, item) => sum + item.orderedQty * item.unitPrice, 0);
  const calculatedTaxable = form.items.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalGst = form.items.reduce((sum, item) => sum + item.gstAmount, 0);
  const grandTotal = Math.round((calculatedTaxable + totalGst) * 100) / 100;

  const handleSubmit = async (saveAsDraft: boolean) => {
    if (!form.supplierId) { toast.error("Please select a supplier"); return; }
    if (form.items.length === 0) { toast.error("Add at least one item"); return; }
    for (const item of form.items) {
      if (!item.productId) { toast.error("All items must have a product selected"); return; }
      if (!item.orderedQty || item.orderedQty <= 0) { toast.error("All items must have a valid quantity"); return; }
    }

    setIsSaving(true);
    try {
      const payload: CreatePurchaseOrderDto = {
        poDate: form.poDate,
        expectedDeliveryDate: form.expectedDeliveryDate || undefined,
        supplierId: form.supplierId,
        isInterState: form.isInterState,
        items: form.items.map((item) => ({
          productId: item.productId,
          orderedQty: item.orderedQty,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
        })),
        notes: form.notes || undefined,
        saveAsDraft,
      };
      const res = await purchaseOrderApi.create(payload);
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      toast.success(saveAsDraft ? "Purchase order saved as draft" : "Purchase order created");
      router.push(`/purchase-orders/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create purchase order");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Create Purchase Order</h2>
            <p className="text-surface-400 text-sm mt-1">Fill in the details to create a new purchase order</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Details</CardTitle>
              <CardDescription>Select the supplier for this purchase order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={supplierSearch}
                    onChange={(e) => { setSupplierSearch(e.target.value); setShowSupplierDropdown(true); }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    placeholder="Search supplier by name, phone, or email..."
                    className="flex h-10 w-full rounded-lg border border-surface-700 bg-surface-900/50 pl-10 pr-10 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200"
                  />
                  {supplierSearch && (
                    <button onClick={() => { setSupplierSearch(""); setShowSupplierDropdown(false); updateForm({ supplierId: "", supplierName: "" }); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {showSupplierDropdown && supplierSearchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-20 mt-1 w-full rounded-xl glass-dark p-1 shadow-2xl border border-surface-700/50 max-h-60 overflow-y-auto"
                    >
                      {supplierSearchResults.map((s: any) => (
                        <button
                          key={s.value}
                          onClick={() => selectSupplier(s)}
                          className="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-700/50 text-left transition-colors"
                        >
                          <div>
                            <p className="font-medium text-white">{s.label}</p>
                            {s.subLabel && <p className="text-xs text-surface-400">{s.subLabel}</p>}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {form.supplierId && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-sm font-medium text-emerald-400">✓ {form.supplierName}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PO Details</CardTitle>
              <CardDescription>Set the order dates</CardDescription>
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
                  label="Expected Delivery"
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
                  <CardDescription>Add products to the purchase order</CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-surface-700/30">
                {form.items.map((item, index) => (
                  <motion.div
                    key={item._tempId}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 py-3 hover:bg-surface-800/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs text-surface-500 font-mono mt-2 shrink-0">{index + 1}.</span>
                        <div className="relative flex-1 min-w-0">
                          {item.productId ? (
                            <div className="flex items-center gap-2 bg-surface-800/50 rounded-lg px-3 py-2 border border-surface-700/50">
                              <span className="text-sm font-medium text-white truncate">{item.productName}</span>
                              <button
                                onClick={() => updateItem(index, { productId: "", productName: "", hsnCode: "", unitPrice: 0, gstRate: 18 })}
                                className="text-surface-500 hover:text-red-400 shrink-0"
                                title="Change product"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                              <input
                                type="text"
                                value={productSearchIndex === index ? productSearchTerm : ""}
                                onChange={(e) => { setProductSearchTerm(e.target.value); setProductSearchIndex(index); }}
                                onFocus={() => { setProductSearchTerm(""); setProductSearchIndex(index); }}
                                placeholder="Search product by name..."
                                className="w-full h-10 rounded-lg border border-surface-700 bg-surface-900/50 pl-10 pr-3 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all outline-none"
                              />
                              <AnimatePresence>
                                {productSearchIndex === index && productSearchResults.length > 0 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute z-20 left-0 right-0 mt-1 rounded-xl glass-dark p-1.5 shadow-2xl border border-surface-700/50 max-h-56 overflow-y-auto"
                                  >
                                    {productSearchResults.map((p: any) => {
                                      const sub = p.subLabel || "";
                                      const priceMatch = sub.match(/₹([\d,]+\.?\d*)/);
                                      const displayPrice = priceMatch ? priceMatch[0] : "";
                                      const gstMatch = sub.match(/GST\s*([\d.]+)%/);
                                      const displayGst = gstMatch ? `GST ${gstMatch[1]}%` : "";
                                      return (
                                        <button
                                          key={p.value}
                                          onClick={() => selectProduct(index, p)}
                                          className="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-700/50 text-left transition-colors gap-3"
                                        >
                                          <div className="min-w-0 flex-1">
                                            <p className="font-medium text-white truncate">{p.label}</p>
                                            {p.subLabel && <p className="text-[11px] text-surface-500 truncate mt-0.5">{p.subLabel}</p>}
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            {displayPrice && <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">{displayPrice}</span>}
                                            {displayGst && <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full whitespace-nowrap">{displayGst}</span>}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </div>
                      {form.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="mt-2 p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                      <div>
                        <label className="block text-[10px] font-medium text-surface-500 uppercase tracking-wider mb-1">Qty</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.orderedQty || ""}
                          onChange={(e) => updateItem(index, { orderedQty: Number(e.target.value) })}
                          className="w-full h-9 rounded-lg border border-surface-700 bg-surface-900/50 px-3 text-sm text-right text-white placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-surface-500 uppercase tracking-wider mb-1">Rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice || ""}
                          onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                          className="w-full h-9 rounded-lg border border-surface-700 bg-surface-900/50 px-3 text-sm text-right text-white placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-surface-500 uppercase tracking-wider mb-1">Disc %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.discountPercent || ""}
                          onChange={(e) => updateItem(index, { discountPercent: Number(e.target.value) })}
                          className="w-full h-9 rounded-lg border border-surface-700 bg-surface-900/50 px-3 text-sm text-right text-white placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 outline-none transition-all"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-1">
                        <label className="block text-[10px] font-medium text-surface-500 uppercase tracking-wider mb-1">GST Rate</label>
                        <div className="h-9 rounded-lg bg-surface-800/50 border border-surface-700/50 px-3 flex items-center justify-end text-sm text-blue-400 font-medium">
                          {item.gstRate}%
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 mt-2 pt-2 border-t border-surface-700/20 text-xs">
                      <span className="text-surface-400">
                        Taxable: <span className="text-surface-200 font-medium">{formatCurrency(item.taxableAmount)}</span>
                      </span>
                      <span className="text-surface-400">
                        GST: <span className="text-blue-400 font-medium">{formatCurrency(item.gstAmount)}</span>
                      </span>
                      <span className="text-surface-400">
                        Total: <span className="text-white font-semibold">{formatCurrency(item.totalAmount)}</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-surface-700/50 px-4 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <Button variant="secondary" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
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
              <CardDescription>Additional information for the supplier</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={form.notes}
                onChange={(e) => updateForm({ notes: e.target.value })}
                rows={3}
                className="flex w-full rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 resize-none"
                placeholder="Delivery instructions, payment terms, or other notes..."
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

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg" variant="glow" onClick={() => handleSubmit(false)} isLoading={isSaving}>
                <Send className="h-4 w-4 mr-2" /> Create PO
              </Button>
              <Button variant="secondary" className="w-full" size="lg" onClick={() => handleSubmit(true)} isLoading={isSaving}>
                <Save className="h-4 w-4 mr-2" /> Save as Draft
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
