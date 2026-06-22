"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";

export interface Column<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onSort?: (key: string, desc: boolean) => void;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  onSort,
  sortBy,
  sortDesc,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onRowClick,
  keyExtractor,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const totalPages = totalCount ? Math.ceil(totalCount / (pageSize || 10)) : 0;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            {columns.map((col) => (
              <div key={col.key} className="skeleton h-4 flex-1 rounded" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-700/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-medium text-surface-400 uppercase tracking-wider",
                    col.sortable && "cursor-pointer hover:text-surface-200 select-none",
                    col.className
                  )}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      onSort(col.key, sortBy === col.key ? !sortDesc : false);
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="inline-flex">
                        {sortBy === col.key ? (
                          sortDesc ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700/30">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-surface-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <motion.tr
                  key={keyExtractor(item)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={cn(
                    "transition-colors duration-150",
                    onRowClick && "cursor-pointer hover:bg-surface-800/50"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-sm text-surface-200", col.className)}>
                      {col.cell ? col.cell(item) : item[col.key] ?? "-"}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-surface-700/50">
          <p className="text-sm text-surface-400">
            Showing {((page || 1) - 1) * (pageSize || 10) + 1} to{" "}
            {Math.min((page || 1) * (pageSize || 10), totalCount || 0)} of {totalCount} results
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange((page || 1) - 1)}
              disabled={(page || 1) <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = Math.max(1, Math.min((page || 1) - 2, totalPages - 4)) + i;
              if (pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange((page || 1) + 1)}
              disabled={(page || 1) >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
