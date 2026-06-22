"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { productApi, categoryApi } from "@/lib/api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { ProductType, UnitOfMeasure } from "@/types";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  hsnCode: z.string().min(1, "HSN code is required"),
  barcode: z.string().optional(),
  productType: z.nativeEnum(ProductType),
  unit: z.nativeEnum(UnitOfMeasure),
  purchasePrice: z.coerce.number().min(0, "Must be >= 0"),
  salePrice: z.coerce.number().min(0, "Must be >= 0"),
  mrp: z.coerce.number().optional(),
  gstRate: z.coerce.number().min(0, "Must be >= 0"),
  cessRate: z.coerce.number().optional(),
  trackInventory: z.boolean(),
  minimumStock: z.coerce.number().min(0, "Must be >= 0"),
  reorderQty: z.coerce.number().optional(),
  storageLocation: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: product, isLoading: isFetching } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => { const res = await productApi.getById(id); return res.data.data; },
  });

  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => { const res = await categoryApi.list(); return res.data.data; },
  });

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as any,
  });

  const trackInventory = watch("trackInventory");

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        sku: product.sku,
        hsnCode: product.hsnCode,
        barcode: product.barcode || "",
        productType: product.productType,
        unit: product.unit,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        mrp: product.mrp || undefined,
        gstRate: product.gstRate,
        cessRate: product.cessRate || undefined,
        trackInventory: product.trackInventory,
        minimumStock: product.minimumStock,
        reorderQty: product.reorderQty || undefined,
        storageLocation: product.storageLocation || "",
        categoryId: product.categoryId || "",
        isActive: product.isActive,
      });
    }
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ProductForm) => productApi.update(id, {
      ...data,
      categoryId: data.categoryId || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Product updated successfully");
      router.push(`/products/${id}`);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update product"),
  });

  if (isFetching) return <PageLoading />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Product</h2>
          <p className="text-surface-400 text-sm">{product?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))}>
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle><CardDescription>Product name, type, and identifiers</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Product Name *" placeholder="Wireless Mouse" error={errors.name?.message} {...register("name")} />
              <Input label="SKU *" placeholder="WM-001" error={errors.sku?.message} {...register("sku")} />
              <Input label="HSN Code *" placeholder="84716040" error={errors.hsnCode?.message} {...register("hsnCode")} />
              <Input label="Barcode" placeholder="8901234567890" {...register("barcode")} />
              <Select label="Product Type *" options={Object.values(ProductType).map((t) => ({ value: t, label: t }))} {...register("productType")} />
              <Select label="Unit of Measure *" options={Object.values(UnitOfMeasure).map((u) => ({ value: u, label: u }))} {...register("unit")} />
            </div>
            <Input label="Description" placeholder="Brief description of the product..." {...register("description")} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Pricing & Tax</CardTitle><CardDescription>Price, GST, and related information</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input label="Purchase Price *" type="number" placeholder="0" step="0.01" error={errors.purchasePrice?.message} {...register("purchasePrice")} />
              <Input label="Sale Price *" type="number" placeholder="0" step="0.01" error={errors.salePrice?.message} {...register("salePrice")} />
              <Input label="MRP" type="number" placeholder="0" step="0.01" {...register("mrp")} />
              <Input label="GST Rate (%) *" type="number" placeholder="18" error={errors.gstRate?.message} {...register("gstRate")} />
              <Input label="Cess Rate (%)" type="number" placeholder="0" step="0.01" {...register("cessRate")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader><CardTitle>Inventory</CardTitle><CardDescription>Stock tracking and reorder settings</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <input type="checkbox" id="trackInventory" {...register("trackInventory")} className="rounded border-surface-700 bg-surface-900/50 text-primary-500 focus:ring-primary-500/30" />
              <label htmlFor="trackInventory" className="text-sm text-surface-200">Track inventory for this product</label>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <input type="checkbox" id="isActive" {...register("isActive")} className="rounded border-surface-700 bg-surface-900/50 text-primary-500 focus:ring-primary-500/30" />
              <label htmlFor="isActive" className="text-sm text-surface-200">Product is active</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Minimum Stock *" type="number" placeholder="0" error={errors.minimumStock?.message} {...register("minimumStock")} />
              <Input label="Reorder Quantity" type="number" placeholder="0" disabled={!trackInventory} {...register("reorderQty")} />
              <Input label="Storage Location" placeholder="Warehouse A, Shelf 12" {...register("storageLocation")} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Category</CardTitle>
                <CardDescription>Organize your products</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/product-categories/new")}>
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              label="Category"
              placeholder="Select a category (optional)"
              options={(categories || []).map((c: any) => ({ value: c.id, label: c.name }))}
              {...register("categoryId")}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={updateMutation.isPending}><Save className="h-4 w-4 mr-2" /> Update Product</Button>
        </div>
      </form>
    </motion.div>
  );
}
