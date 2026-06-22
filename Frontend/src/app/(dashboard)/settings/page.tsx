"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { tenantApi } from "@/lib/api/endpoints";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { Save, Building2, MapPin, Landmark, FileCog, Upload } from "lucide-react";
import { resolveBackendUrl } from "@/lib/utils/cn";
import toast from "react-hot-toast";

const tenantSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  legalName: z.string().optional().or(z.literal("")),
  gstin: z.string().optional().or(z.literal("")),
  pan: z.string().optional().or(z.literal("")),
  tan: z.string().optional().or(z.literal("")),
  cin: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  invoicePrefix: z.string().min(1, "Prefix is required"),
  purchasePrefix: z.string().min(1, "Prefix is required"),
  financialYearStart: z.string().min(1, "Required"),
  bankName: z.string().optional().or(z.literal("")),
  bankAccountNumber: z.string().optional().or(z.literal("")),
  bankIFSC: z.string().optional().or(z.literal("")),
  bankBranch: z.string().optional().or(z.literal("")),
  upiId: z.string().optional().or(z.literal("")),
  address: z.object({
    line1: z.string().optional().or(z.literal("")),
    line2: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    stateCode: z.string().optional().or(z.literal("")),
    pinCode: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
  }).optional(),
});

type TenantForm = z.infer<typeof tenantSchema>;

const defaultAddress = { line1: "", line2: "", city: "", state: "", stateCode: "", pinCode: "", country: "India" };

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const hasInitialized = useRef(false);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant"],
    queryFn: async () => { const res = await tenantApi.get(); return res.data.data; },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema) as any,
  });

  useEffect(() => {
    if (tenant && !hasInitialized.current) {
      hasInitialized.current = true;
      reset({
        businessName: tenant.businessName || "",
        legalName: tenant.legalName || "",
        gstin: tenant.gstin || "",
        pan: tenant.pan || "",
        tan: tenant.tan || "",
        cin: tenant.cin || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        website: tenant.website || "",
        invoicePrefix: tenant.invoicePrefix || "INV",
        purchasePrefix: tenant.purchasePrefix || "PO",
        financialYearStart: tenant.financialYearStart || "April",
        bankName: tenant.bankName || "",
        bankAccountNumber: tenant.bankAccountNumber || "",
        bankIFSC: tenant.bankIFSC || "",
        bankBranch: tenant.bankBranch || "",
        upiId: tenant.upiId || "",
        address: tenant.address || defaultAddress,
      });
    }
  }, [tenant, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: TenantForm) => {
      const payload = {
        ...data,
        address: data.address ? {
          line1: data.address.line1 || "",
          line2: data.address.line2 || "",
          city: data.address.city || "",
          state: data.address.state || "",
          stateCode: data.address.stateCode || "",
          pinCode: data.address.pinCode || "",
          country: data.address.country || "India",
        } : undefined,
      };
      return tenantApi.update(payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tenant"] }); toast.success("Settings updated", { id: "settings-update" }); },
    onError: () => toast.error("Failed to update settings", { id: "settings-error" }),
  });

  const logoUrl = !logoError ? resolveBackendUrl(tenant?.businessLogo) : null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { toast.error("Logo must be under 1MB"); e.target.value = ""; return; }
    setUploading(true);
    try { await tenantApi.uploadLogo(file); setLogoError(false); queryClient.invalidateQueries({ queryKey: ["tenant"] }); toast.success("Logo uploaded", { id: "logo-upload" }); }
    catch { toast.error("Failed to upload logo"); }
    finally { setUploading(false); }
  };

  if (isLoading) return <PageLoading />;

  const tabs = [
    { id: "general", label: "General", icon: <Building2 className="h-4 w-4" /> },
    { id: "address", label: "Address", icon: <MapPin className="h-4 w-4" /> },
    { id: "banking", label: "Banking", icon: <Landmark className="h-4 w-4" /> },
    { id: "invoice", label: "Invoice Settings", icon: <FileCog className="h-4 w-4" /> },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-surface-400 text-sm mt-1">Manage your business settings</p>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
        <Tabs tabs={tabs}>
          {(activeTab) => (
            <Card>
              <CardContent className="space-y-4">
                {activeTab === "general" && (
                  <>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative group">
                        <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                          {logoUrl ? <img src={logoUrl} onError={() => setLogoError(true)} className="h-full w-full object-cover rounded-xl" alt="logo" /> : (tenant?.businessName?.charAt(0) || "B")}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Upload className="h-5 w-5 text-white" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Business Logo</h3>
                        <p className="text-sm text-surface-400">Upload your company logo</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Business Name *" error={errors.businessName?.message} {...register("businessName")} />
                      <Input label="Legal Name" {...register("legalName")} />
                      <Input label="GSTIN" {...register("gstin")} />
                      <Input label="PAN" {...register("pan")} />
                      <Input label="TAN" {...register("tan")} />
                      <Input label="CIN" {...register("cin")} />
                      <Input label="Email" type="email" {...register("email")} />
                      <Input label="Phone" {...register("phone")} />
                      <Input label="Website" {...register("website")} />
                    </div>
                  </>
                )}

                {activeTab === "address" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Address Line 1" className="col-span-2" {...register("address.line1")} />
                    <Input label="Address Line 2" className="col-span-2" {...register("address.line2")} />
                    <Input label="City" {...register("address.city")} />
                    <Input label="State" {...register("address.state")} />
                    <Input label="State Code" {...register("address.stateCode")} />
                    <Input label="PIN Code" {...register("address.pinCode")} />
                    <Input label="Country" {...register("address.country")} />
                  </div>
                )}

                {activeTab === "banking" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Bank Name" {...register("bankName")} />
                    <Input label="Account Number" {...register("bankAccountNumber")} />
                    <Input label="IFSC Code" {...register("bankIFSC")} />
                    <Input label="Branch" {...register("bankBranch")} />
                    <Input label="UPI ID" {...register("upiId")} />
                  </div>
                )}

                {activeTab === "invoice" && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Invoice Prefix *" {...register("invoicePrefix")} />
                    <Input label="Purchase Order Prefix *" {...register("purchasePrefix")} />
                    <Input label="Financial Year Start" {...register("financialYearStart")} />
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-surface-700/50">
                  <Button type="submit" isLoading={updateMutation.isPending}><Save className="h-4 w-4 mr-2" /> Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </Tabs>
      </form>
    </motion.div>
  );
}
