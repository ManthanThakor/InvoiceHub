"use client";

import { useState } from "react";
import { cn, getInitials, resolveBackendUrl } from "@/lib/utils/cn";

interface AvatarProps {
  src?: string;
  firstName?: string;
  lastName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function Avatar({ src, firstName, lastName, size = "md", className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const resolvedSrc = resolveBackendUrl(src);

  if (resolvedSrc && !imgError) {
    return (
      <img
        src={resolvedSrc}
        alt={`${firstName || ""} ${lastName || ""}`}
        onError={() => setImgError(true)}
        className={cn("rounded-full object-cover ring-2 ring-surface-700", sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary-600/20 ring-2 ring-primary-500/20 flex items-center justify-center font-semibold text-primary-400",
        sizeMap[size],
        className
      )}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
}
