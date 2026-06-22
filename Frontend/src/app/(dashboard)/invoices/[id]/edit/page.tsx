"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi, customerApi, productApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageLoading } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils/cn";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { DiscountType, type UpdateInvoiceDto, type InvoiceDto } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Search, X, Save, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";

const INDIAN_STATES = [
  { value: "AP", label: "Andhra Pradesh" }, { value: "AR", label: "Arunachal Pradesh" },
  { value: "AS", label: "Assam" }, { value: "BR", label: "Bihar" },
  { value: "CG", label: "Chhattisgarh" }, { value: "GA", label: "Goa" },
  { value: "GJ", label: "Gujarat" }, { value: "HR", label: "Haryana" },
  { value: "HP", label: "Himachal Pradesh" }, { value: "JK", label: "Jammu & Kashmir" },
  { value: "JH", label: "Jharkhand" }, { value: "KA", label: "Karnataka" },
  { value: "KL", label: "Kerala" }, { value: "MP", label: "Madhya Pradesh" },
  { value: "MH", label: "Maharashtra" }, { value: "MN", label: "Manipur" },
  { value: "ML", label: "Meghalaya" }, { value: "MZ", label: "Mizoram" },
  { value: "NL", label: "Nagaland" }, { value: "OD", label: "Odisha" },
  { value: "PB", label: "Punjab" }, { value: "RJ", label: "Rajasthan" },
  { value: "SK", label: "Sikkim" }, { value: "TN", label: "Tamil Nadu" },
  { value: "TS", label: "Telangana" }, { value: "TR", label: "Tripura" },
  { value: "UP", label: "Uttar Pradesh" }, { value: "UK", label: "Uttarakhand" },
  { value: "WB", label: "West Bengal" },
  { value: "AN", label: "Andaman & Nicobar" }, { value: "CH", label: "Chandigarh" },
  { value: "DN", label: "Dadra & Nagar Haveli" }, { value: "DD", label: "Daman & Diu" },
  { value: "DL", label: "Delhi" }, { value: "LD", label: "Lakshadweep" },
  { value: "PY", label: "Puducherry" },
];

interface LineItemForm {
  _tempId: string;
  productId: string;
  productName: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  gstRate: number;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
}

interface EditFormData {
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  isInterState: boolean;
  items: LineItemForm[];
  discountType: string;
  discountPercent: number;
  discountAmount: number;
  notes: string;
  termsAndConditions: string;
  eWayBillNumber: string;
}

const defaultItem = (): LineItemForm => ({
  _tempId: crypto.randomUUID(),
  productId: "",
  productName: "",
  hsnCode: "",
  quantity: 1,
  unit: "Pieces",
  unitPrice: 0,
  discountPercent: 0,
  gstRate: 18,
  taxableAmount: 0,
  gstAmount: 0,
  totalAmount: 0,
});

function calcItem(item: LineItemForm, isInterState: boolean): LineItemForm {
  const qty = item.quantity || 0;
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

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [productSearchIndex, setProductSearchIndex] = useState<number | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const debouncedProductSearch = useDebounce(productSearchTerm, 300);

  const { data: invoice, isLoading: loadingInvoice } = useQuery({
    queryKey: ["invoice", params.id],
    queryFn: async () => {
      const res = await invoiceApi.getById(params.id);
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
    invoiceDate: "",
    dueDate: "",
    placeOfSupply: "",
    placeOfSupplyCode: "",
    isInterState: false,
    items: [{ ...defaultItem() }],
    discountType: DiscountType.None,
    discountPercent: 0,
    discountAmount: 0,
    notes: "",
    termsAndConditions: "",
    eWayBillNumber: "",
  });

  useEffect(() => {
    if (invoice) {
      setForm({
        invoiceDate: invoice.invoiceDate?.split("T")[0] || "",
        dueDate: invoice.dueDate?.split("T")[0] || "",
        placeOfSupply: invoice.placeOfSupply || "",
        placeOfSupplyCode: invoice.placeOfSupplyCode || "",
        isInterState: invoice.isInterState,
        items: invoice.items.map((item) => ({
          _tempId: crypto.randomUUID(),
          productId: item.productId,
          productName: item.productName,
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          gstRate: item.gstRate,
          taxableAmount: item.taxableAmount,
          gstAmount: invoice.isInterState ? item.igstAmount : item.cgstAmount + item.sgstAmount,
          totalAmount: item.totalAmount,
        })),
        discountType: invoice.discountType,
        discountPercent: invoice.discountPercent || 0,
        discountAmount: invoice.discountAmount,
        notes: invoice.notes || "",
        termsAndConditions: invoice.termsAndConditions || "",
        eWayBillNumber: invoice.eWayBillNumber || "",
      });
    }
  }, [invoice]);

  const [isSaving, setIsSaving] = useState(false);

  const updateForm = useCallback((patch: Partial<EditFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateItem = useCallback((index: number, patch: Partial<LineItemForm>) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = calcItem({ ...items[index], ...patch }, prev.isInterState);
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

  const calculatedSubTotal = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const calculatedTaxable = form.items.reduce((sum, item) => sum + item.taxableAmount, 0);

  let discountAmount = 0;
  if (form.discountType === DiscountType.Percentage) {
    discountAmount = (calculatedTaxable * (form.discountPercent || 0)) / 100;
  } else if (form.discountType === DiscountType.FixedAmount) {
    discountAmount = form.discountAmount || 0;
  }

  const totalGst = form.items.reduce((sum, item) => sum + item.gstAmount, 0);
  const grandTotal = Math.round((calculatedTaxable - discountAmount + totalGst) * 100) / 100;

  const handleSubmit = async () => {
    if (form.items.length === 0) { toast.error("Add at least one item"); return; }
    for (const item of form.items) {
      if (!item.productId) { toast.error("All items must have a product selected"); return; }
      if (!item.quantity || item.quantity <= 0) { toast.error("All items must have a valid quantity"); return; }
    }

    setIsSaving(true);
    try {
      const payload: UpdateInvoiceDto = {
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate || undefined,
        isInterState: form.isInterState,
        placeOfSupply: form.placeOfSupply,
        placeOfSupplyCode: form.placeOfSupplyCode,
        items: form.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
        })),
        discountType: form.discountType as DiscountType,
        discountPercent: form.discountType === DiscountType.Percentage ? form.discountPercent : undefined,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        notes: form.notes || undefined,
        termsAndConditions: form.termsAndConditions || undefined,
        eWayBillNumber: form.eWayBillNumber || undefined,
      };
      await invoiceApi.update(params.id, payload);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", params.id] });
      toast.success("Invoice updated");
      router.push(`/invoices/${params.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update invoice");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingInvoice) return <PageLoading />;
  if (!invoice) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Invoice</h2>
            <p className="text-surface-400 text-sm mt-1">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/30">
                <p className="text-sm font-medium text-white">{invoice.customerName}</p>
                {invoice.customerGSTIN && <p className="text-xs text-surface-400 mt-0.5">GSTIN: {invoice.customerGSTIN}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Invoice Date"
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) => updateForm({ invoiceDate: e.target.value })}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => updateForm({ dueDate: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>Modify invoice items</CardDescription>
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
                            value={item.quantity || ""}
                            onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
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
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-surface-400">Discount</span>
                      <div className="flex items-center gap-1">
                        <select
                          value={form.discountType}
                          onChange={(e) => updateForm({ discountType: e.target.value })}
                          className="bg-transparent text-xs text-surface-400 border border-surface-700 rounded px-1 py-0.5"
                        >
                          <option value={DiscountType.None}>None</option>
                          <option value={DiscountType.Percentage}>%</option>
                          <option value={DiscountType.FixedAmount}>Fixed</option>
                        </select>
                        {form.discountType === DiscountType.Percentage && (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.discountPercent || ""}
                            onChange={(e) => updateForm({ discountPercent: Number(e.target.value) })}
                            className="w-14 bg-transparent text-sm text-right text-white border-b border-surface-700 focus:border-primary-500/50 outline-none py-0.5"
                          />
                        )}
                        {form.discountType === DiscountType.FixedAmount && (
                          <input
                            type="number"
                            min="0"
                            value={form.discountAmount || ""}
                            onChange={(e) => updateForm({ discountAmount: Number(e.target.value) })}
                            className="w-20 bg-transparent text-sm text-right text-white border-b border-surface-700 focus:border-primary-500/50 outline-none py-0.5"
                          />
                        )}
                      </div>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-surface-400">Discount Amount</span>
                        <span className="text-red-400">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-400">Taxable Amount</span>
                      <span className="text-surface-200">{formatCurrency(calculatedTaxable - discountAmount)}</span>
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
              <CardTitle>Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm({ notes: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 resize-none"
                  placeholder="Additional notes for the customer..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Terms & Conditions</label>
                <textarea
                  value={form.termsAndConditions}
                  onChange={(e) => updateForm({ termsAndConditions: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 resize-none"
                  placeholder="Terms and conditions..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supply Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Select
                  label="Place of Supply (State)"
                  value={form.placeOfSupplyCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const state = INDIAN_STATES.find((s) => s.value === code);
                    updateForm({
                      placeOfSupplyCode: code,
                      placeOfSupply: state?.label || "",
                      isInterState: code !== form.placeOfSupplyCode ? true : form.isInterState,
                    });
                  }}
                  options={INDIAN_STATES.map((s) => ({ value: s.value, label: s.label }))}
                  placeholder="Select state"
                />
              </div>
              {form.isInterState && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs font-medium text-blue-400">Inter-State Supply</p>
                  <p className="text-xs text-blue-300 mt-0.5">IGST will be applied</p>
                </motion.div>
              )}
              {!form.isInterState && form.placeOfSupplyCode && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs font-medium text-emerald-400">Intra-State Supply</p>
                  <p className="text-xs text-emerald-300 mt-0.5">CGST + SGST will be applied</p>
                </motion.div>
              )}
              <Input
                label="E-Way Bill Number"
                value={form.eWayBillNumber}
                onChange={(e) => updateForm({ eWayBillNumber: e.target.value })}
                placeholder="Optional"
              />
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
                    <span className="text-surface-200">{formatCurrency(calculatedTaxable - discountAmount)}</span>
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
            <Save className="h-4 w-4 mr-2" /> Update Invoice
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
