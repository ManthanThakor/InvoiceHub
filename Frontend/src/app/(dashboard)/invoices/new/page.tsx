"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { invoiceApi, customerApi, productApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/cn";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { DiscountType, UnitOfMeasure, type CreateInvoiceDto } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Search, X, Calculator, Save, Send, ChevronDown, IndianRupee } from "lucide-react";
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

interface InvoiceFormData {
  customerId: string;
  customerName: string;
  customerGSTIN: string;
  customerBillingState: string;
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
  shippingDetails: string;
  vehicleNumber: string;
  eWayBillNumber: string;
}

const defaultItem = (): LineItemForm => ({
  _tempId: crypto.randomUUID(),
  productId: "",
  productName: "",
  hsnCode: "",
  quantity: 1,
  unit: UnitOfMeasure.Pieces,
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
  let gstAmt = 0;
  if (isInterState) {
    gstAmt = (taxable * gstRate) / 100;
  } else {
    gstAmt = (taxable * gstRate) / 100;
  }
  return {
    ...item,
    taxableAmount: Math.round(taxable * 100) / 100,
    gstAmount: Math.round(gstAmt * 100) / 100,
    totalAmount: Math.round((taxable + gstAmt) * 100) / 100,
  };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [productSearchIndex, setProductSearchIndex] = useState<number | null>(null);
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

  const { data: customersData } = useQuery({
    queryKey: ["customer-search", debouncedCustomerSearch],
    queryFn: async () => {
      if (!debouncedCustomerSearch) return { items: [] };
      const res = await customerApi.search(debouncedCustomerSearch);
      return { items: res.data.data || [] };
    },
    enabled: debouncedCustomerSearch.length > 0,
  });

  const customerSearchResults = customersData?.items || [];

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

  const [form, setForm] = useState<InvoiceFormData>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("invoiceForm");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...parsed, customerSearch: undefined };
        } catch { }
      }
    }
    return {
      customerId: "",
      customerName: "",
      customerGSTIN: "",
      customerBillingState: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      placeOfSupply: "",
      placeOfSupplyCode: "",
      isInterState: false,
      items: [{ ...defaultItem() }],
      discountType: DiscountType.None,
      discountPercent: 0,
      discountAmount: 0,
      notes: "",
      termsAndConditions: "",
      shippingDetails: "",
      vehicleNumber: "",
      eWayBillNumber: "",
    };
  });

  useEffect(() => {
    sessionStorage.setItem("invoiceForm", JSON.stringify(form));
  }, [form]);

  const [isSaving, setIsSaving] = useState(false);

  const updateForm = useCallback((patch: Partial<InvoiceFormData>) => {
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

  const selectCustomer = useCallback((c: any) => {
    const stateCode = c.subLabel || "";
    const isInterState = stateCode !== "" && stateCode !== form.placeOfSupplyCode;
    updateForm({
      customerId: c.value,
      customerName: c.label,
      customerGSTIN: "",
      customerBillingState: stateCode,
    });
    if (!form.placeOfSupplyCode) {
      updateForm({ placeOfSupplyCode: stateCode, placeOfSupply: INDIAN_STATES.find(s => s.value === stateCode)?.label || "" });
    }
    setShowCustomerDropdown(false);
    setCustomerSearch(c.label);
  }, [form.placeOfSupplyCode, updateForm]);

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

  const handleSubmit = async (saveAsDraft: boolean) => {
    if (!form.customerId) { toast.error("Please select a customer"); return; }
    if (form.items.length === 0) { toast.error("Add at least one item"); return; }
    for (const item of form.items) {
      if (!item.productId) { toast.error("All items must have a product selected"); return; }
      if (!item.quantity || item.quantity <= 0) { toast.error("All items must have a valid quantity"); return; }
    }

    setIsSaving(true);
    try {
      const payload: CreateInvoiceDto = {
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate || undefined,
        customerId: form.customerId,
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
        shippingDetails: form.shippingDetails || undefined,
        vehicleNumber: form.vehicleNumber || undefined,
        eWayBillNumber: form.eWayBillNumber || undefined,
        saveAsDraft,
      };
      const res = await invoiceApi.create(payload);
      sessionStorage.removeItem("invoiceForm");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(saveAsDraft ? "Invoice saved as draft" : "Invoice created and sent");
      router.push(`/invoices/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create invoice");
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
            <h2 className="text-2xl font-bold text-white">Create Invoice</h2>
            <p className="text-surface-400 text-sm mt-1">Fill in the details to create a new invoice</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Select the customer for this invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Search customer by name, phone, or email..."
                    className="flex h-10 w-full rounded-lg border border-surface-700 bg-surface-900/50 pl-10 pr-10 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200"
                  />
                  {customerSearch && (
                    <button onClick={() => { setCustomerSearch(""); setShowCustomerDropdown(false); updateForm({ customerId: "", customerName: "" }); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {showCustomerDropdown && customerSearchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-20 mt-1 w-full rounded-xl glass-dark p-1 shadow-2xl border border-surface-700/50 max-h-60 overflow-y-auto"
                    >
                      {customerSearchResults.map((c: any, i: number) => (
                        <button
                          key={c.value}
                          onClick={() => selectCustomer(c)}
                          className="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-700/50 text-left transition-colors"
                        >
                          <div>
                            <p className="font-medium text-white">{c.label}</p>
                            {c.subLabel && <p className="text-xs text-surface-400">{c.subLabel}</p>}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {form.customerId && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-sm font-medium text-emerald-400">✓ {form.customerName}</p>
                </motion.div>
              )}
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
                  <CardDescription>Add products or services to the invoice</CardDescription>
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
                          value={item.quantity || ""}
                          onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
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

              <div className="border-t border-surface-700/50 px-4 py-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <Button variant="secondary" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                  <div className="w-full sm:w-80 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-400">Sub Total</span>
                      <span className="text-surface-200">{formatCurrency(calculatedSubTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center gap-2">
                      <span className="text-surface-400 shrink-0">Discount</span>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={form.discountType}
                          onChange={(e) => updateForm({ discountType: e.target.value })}
                          className="h-8 rounded-lg border border-surface-700 bg-surface-900/50 px-2 text-xs text-surface-300 focus:border-primary-500/50 outline-none"
                        >
                          <option value={DiscountType.None}>None</option>
                          <option value={DiscountType.Percentage}>%</option>
                          <option value={DiscountType.FixedAmount}>₹ Fixed</option>
                        </select>
                        {form.discountType === DiscountType.Percentage && (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.discountPercent || ""}
                            onChange={(e) => updateForm({ discountPercent: Number(e.target.value) })}
                            className="w-16 h-8 rounded-lg border border-surface-700 bg-surface-900/50 px-2 text-sm text-right text-white focus:border-primary-500/50 outline-none"
                          />
                        )}
                        {form.discountType === DiscountType.FixedAmount && (
                          <input
                            type="number"
                            min="0"
                            value={form.discountAmount || ""}
                            onChange={(e) => updateForm({ discountAmount: Number(e.target.value) })}
                            className="w-24 h-8 rounded-lg border border-surface-700 bg-surface-900/50 px-2 text-sm text-right text-white focus:border-primary-500/50 outline-none"
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
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Shipping Details</label>
                <textarea
                  value={form.shippingDetails}
                  onChange={(e) => updateForm({ shippingDetails: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 resize-none"
                  placeholder="Shipping address or delivery instructions..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm({ notes: e.target.value })}
                  rows={2}
                  className="flex w-full rounded-lg border border-surface-700 bg-surface-900/50 px-3 py-2 text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 resize-none"
                  placeholder="Additional notes for the customer..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Terms & Conditions</label>
                <textarea
                  value={form.termsAndConditions}
                  onChange={(e) => updateForm({ termsAndConditions: e.target.value })}
                  rows={2}
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
                      isInterState: form.customerBillingState ? code !== form.customerBillingState : false,
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
              <Input
                label="Vehicle Number"
                value={form.vehicleNumber}
                onChange={(e) => updateForm({ vehicleNumber: e.target.value })}
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

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg" variant="glow" onClick={() => handleSubmit(false)} isLoading={isSaving}>
                <Send className="h-4 w-4 mr-2" /> Create & Send
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
