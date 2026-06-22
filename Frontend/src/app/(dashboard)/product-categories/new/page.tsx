"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { categoryApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  description: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function NewCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema) as any,
  });

  const onSubmit = async (data: CategoryForm) => {
    setIsLoading(true);
    try {
      await categoryApi.create(data);
      toast.success("Category created successfully");
      router.push("/product-categories");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Add Category</h2>
          <p className="text-surface-400 text-sm">Create a new product category</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader><CardTitle>Category Details</CardTitle><CardDescription>Name and description for the category</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Category Name *" placeholder="Electronics" error={errors.name?.message} {...register("name")} />
            <Input label="Description" placeholder="Electronic gadgets and accessories" {...register("description")} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}><Save className="h-4 w-4 mr-2" /> Save Category</Button>
        </div>
      </form>
    </motion.div>
  );
}
