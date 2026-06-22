"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { supplierApi } from "@/lib/api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import { SupplierStatus } from "@/types";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.nativeEnum(SupplierStatus).optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  paymentTermDays: z.coerce.number().optional(),
  notes: z.string().optional(),
  address: z.object({
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    stateCode: z.string().min(1, "State code is required"),
    pinCode: z.string().min(1, "PIN code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIFSC: z.string().optional(),
});

type SupplierForm = z.infer<typeof supplierSchema>;

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: supplier, isLoading: isFetching } = useQuery({
    queryKey: ["supplier", params.id],
    queryFn: async () => { const res = await supplierApi.getById(params.id); return res.data.data; },
    enabled: !!params.id,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema) as any,
  });

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        status: supplier.status,
        gstin: supplier.gstin || "",
        pan: supplier.pan || "",
        paymentTermDays: supplier.paymentTermDays || undefined,
        notes: supplier.notes || "",
        address: {
          line1: supplier.address.line1,
          line2: supplier.address.line2 || "",
          city: supplier.address.city,
          state: supplier.address.state,
          stateCode: supplier.address.stateCode,
          pinCode: supplier.address.pinCode,
          country: supplier.address.country,
        },
        bankName: supplier.bankName || "",
        bankAccountNumber: supplier.bankAccountNumber || "",
        bankIFSC: supplier.bankIFSC || "",
      });
    }
  }, [supplier, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: SupplierForm) => supplierApi.update(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["supplier", params.id] });
      toast.success("Supplier updated successfully");
      router.push(`/suppliers/${params.id}`);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update supplier"),
  });

  if (isFetching) return <PageLoading />;
  if (!supplier) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Supplier</h2>
          <p className="text-surface-400 text-sm">{supplier.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
        <Card>
          <CardHeader><CardTitle>Supplier Information</CardTitle><CardDescription>Modify supplier details</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Supplier Name *" placeholder="Acme Corp" error={errors.name?.message} {...register("name")} />
              <Input label="Contact Person" placeholder="John Doe" error={errors.contactPerson?.message} {...register("contactPerson")} />
              <Input label="Email" type="email" placeholder="john@acme.com" error={errors.email?.message} {...register("email")} />
              <Input label="Phone" placeholder="+91 98765 43210" {...register("phone")} />
              <Select label="Status" options={Object.values(SupplierStatus).map((s) => ({ value: s, label: s }))} {...register("status")} />
              <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" {...register("gstin")} />
              <Input label="PAN" placeholder="AAAAA0000A" {...register("pan")} />
              <Input label="Payment Terms (days)" type="number" placeholder="30" {...register("paymentTermDays")} />
            </div>
            <Input label="Notes" placeholder="Any notes about this supplier" {...register("notes")} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Address</CardTitle><CardDescription>Supplier's registered address</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Address Line 1 *" placeholder="123 Business Park" error={errors.address?.line1?.message} {...register("address.line1")} />
            <Input label="Address Line 2" placeholder="Suite 100" {...register("address.line2")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City *" placeholder="Mumbai" error={errors.address?.city?.message} {...register("address.city")} />
              <Input label="State *" placeholder="Maharashtra" error={errors.address?.state?.message} {...register("address.state")} />
              <Input label="State Code *" placeholder="27" error={errors.address?.stateCode?.message} {...register("address.stateCode")} />
              <Input label="PIN Code *" placeholder="400001" error={errors.address?.pinCode?.message} {...register("address.pinCode")} />
              <Input label="Country *" placeholder="India" error={errors.address?.country?.message} {...register("address.country")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Bank Details</CardTitle><CardDescription>Supplier's bank information for payments</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Bank Name" placeholder="State Bank of India" {...register("bankName")} />
              <Input label="Account Number" placeholder="XXXXXXXXXXXX" {...register("bankAccountNumber")} />
              <Input label="IFSC Code" placeholder="SBIN0001234" {...register("bankIFSC")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={updateMutation.isPending}><Save className="h-4 w-4 mr-2" /> Update Supplier</Button>
        </div>
      </form>
    </motion.div>
  );
}
