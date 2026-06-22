"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { supplierApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

const supplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
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

export default function NewSupplierPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema) as any,
    defaultValues: { address: { country: "India" } },
  });

  const onSubmit = async (data: SupplierForm) => {
    setIsLoading(true);
    try {
      await supplierApi.create(data);
      toast.success("Supplier created successfully");
      router.push("/suppliers");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create supplier");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Add Supplier</h2>
          <p className="text-surface-400 text-sm">Create a new supplier record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Supplier Information</CardTitle><CardDescription>Basic details about the supplier</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Supplier Name *" placeholder="Acme Corp" error={errors.name?.message} {...register("name")} />
              <Input label="Contact Person" placeholder="John Doe" error={errors.contactPerson?.message} {...register("contactPerson")} />
              <Input label="Email" type="email" placeholder="john@acme.com" error={errors.email?.message} {...register("email")} />
              <Input label="Phone" placeholder="+91 98765 43210" {...register("phone")} />
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
          <Button type="submit" isLoading={isLoading}><Save className="h-4 w-4 mr-2" /> Save Supplier</Button>
        </div>
      </form>
    </motion.div>
  );
}
