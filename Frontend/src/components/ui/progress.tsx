"use client";

import { cn } from "@/lib/utils/cn";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
}

export function Progress({ value, max = 100, className, size = "md", variant = "default" }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const sizeClass = { sm: "h-1", md: "h-2", lg: "h-3" };
  const variantClass = {
    default: "bg-primary-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  return (
    <div className={cn("w-full bg-surface-800 rounded-full overflow-hidden", sizeClass[size], className)}>
      <div
        className={cn("rounded-full transition-all duration-500 ease-out", sizeClass[size], variantClass[variant])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
