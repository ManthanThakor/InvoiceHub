"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { categoryApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/cn";
import { ProductCategoryDto } from "@/types";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Layers } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductCategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const res = await categoryApi.list();
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["product-categories"] }); toast.success("Category deleted"); },
    onError: () => toast.error("Failed to delete category"),
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Product Categories</h2>
          <p className="text-surface-400 text-sm mt-1">Organize your products into categories</p>
        </div>
        <Button onClick={() => router.push("/product-categories/new")} variant="glow">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-surface-400">Loading categories...</div>
          ) : !data?.length ? (
            <div className="p-8 text-center text-surface-400">
              <Layers className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium text-surface-300 mb-1">No categories yet</p>
              <p className="text-sm mb-4">Create your first category to organize products</p>
              <Button onClick={() => router.push("/product-categories/new")} variant="glow">
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-surface-700/50">
              {data.map((cat: ProductCategoryDto) => (
                <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-primary-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{cat.name}</p>
                      {cat.description && <p className="text-xs text-surface-400 mt-0.5">{cat.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cat.parentCategoryName && (
                      <span className="text-xs text-surface-500 bg-surface-800 px-2 py-0.5 rounded-full">
                        Subcategory of {cat.parentCategoryName}
                      </span>
                    )}
                    <span className="text-xs text-surface-500">{formatDate(cat.createdAt)}</span>
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/product-categories/${cat.id}/edit`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => { if (confirm("Delete this category?")) deleteMutation.mutate(cat.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
