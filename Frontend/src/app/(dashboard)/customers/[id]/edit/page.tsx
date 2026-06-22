"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { customerApi } from "@/lib/api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import { CustomerType, CustomerStatus } from "@/types";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  customerType: z.nativeEnum(CustomerType),
  status: z.nativeEnum(CustomerStatus).optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  creditLimit: z.coerce.number().optional(),
  paymentTermDays: z.coerce.number().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  billingAddress: z.object({
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    stateCode: z.string().min(1, "State code is required"),
    pinCode: z.string().min(1, "PIN code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  shippingSameAsBilling: z.boolean().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: customer, isLoading: isFetching } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => { const res = await customerApi.getById(id); return res.data.data; },
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema) as any,
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        contactPerson: customer.contactPerson || "",
        email: customer.email || "",
        phone: customer.phone || "",
        alternatePhone: customer.alternatePhone || "",
        customerType: customer.customerType,
        status: customer.status,
        gstin: customer.gstin || "",
        pan: customer.pan || "",
        creditLimit: customer.creditLimit || undefined,
        paymentTermDays: customer.paymentTermDays || undefined,
        notes: customer.notes || "",
        tags: customer.tags || "",
        billingAddress: {
          line1: customer.billingAddress.line1,
          line2: customer.billingAddress.line2 || "",
          city: customer.billingAddress.city,
          state: customer.billingAddress.state,
          stateCode: customer.billingAddress.stateCode,
          pinCode: customer.billingAddress.pinCode,
          country: customer.billingAddress.country,
        },
        shippingSameAsBilling: customer.shippingSameAsBilling,
      });
    }
  }, [customer, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: CustomerForm) => customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      toast.success("Customer updated successfully");
      router.push(`/customers/${id}`);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update customer"),
  });

  if (isFetching) return <PageLoading />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Customer</h2>
          <p className="text-surface-400 text-sm">{customer?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
        <Card>
          <CardHeader><CardTitle>Customer Information</CardTitle><CardDescription>Basic details about the customer</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Company / Customer Name *" placeholder="Acme Corp" error={errors.name?.message} {...register("name")} />
              <Input label="Contact Person" placeholder="John Doe" error={errors.contactPerson?.message} {...register("contactPerson")} />
              <Input label="Email" type="email" placeholder="john@acme.com" error={errors.email?.message} {...register("email")} />
              <Input label="Phone" placeholder="+91 98765 43210" {...register("phone")} />
              <Input label="Alternate Phone" placeholder="+91 98765 43210" {...register("alternatePhone")} />
              <Select label="Customer Type *" options={Object.values(CustomerType).map((t) => ({ value: t, label: t }))} {...register("customerType")} />
              <Select label="Status" options={Object.values(CustomerStatus).map((s) => ({ value: s, label: s }))} {...register("status")} />
              <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" {...register("gstin")} />
              <Input label="PAN" placeholder="AAAAA0000A" {...register("pan")} />
              <Input label="Credit Limit" type="number" placeholder="0" {...register("creditLimit")} />
              <Input label="Payment Terms (days)" type="number" placeholder="30" {...register("paymentTermDays")} />
            </div>
            <Input label="Notes" placeholder="Any notes about this customer" {...register("notes")} />
            <Input label="Tags" placeholder="comma, separated, tags" {...register("tags")} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Billing Address</CardTitle><CardDescription>Customer's billing address</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Address Line 1 *" placeholder="123 Business Park" error={errors.billingAddress?.line1?.message} {...register("billingAddress.line1")} />
            <Input label="Address Line 2" placeholder="Suite 100" {...register("billingAddress.line2")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City *" placeholder="Mumbai" error={errors.billingAddress?.city?.message} {...register("billingAddress.city")} />
              <Input label="State *" placeholder="Maharashtra" error={errors.billingAddress?.state?.message} {...register("billingAddress.state")} />
              <Input label="State Code *" placeholder="27" error={errors.billingAddress?.stateCode?.message} {...register("billingAddress.stateCode")} />
              <Input label="PIN Code *" placeholder="400001" error={errors.billingAddress?.pinCode?.message} {...register("billingAddress.pinCode")} />
              <Input label="Country *" placeholder="India" error={errors.billingAddress?.country?.message} {...register("billingAddress.country")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={updateMutation.isPending}><Save className="h-4 w-4 mr-2" /> Update Customer</Button>
        </div>
      </form>
    </motion.div>
  );
}
