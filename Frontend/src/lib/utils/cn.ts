import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7001";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveBackendUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/^\/?(?:uploads\/)?/, "");
  return `${BACKEND_URL}/uploads/${clean}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, format: "short" | "long" | "relative" = "short"): string {
  const d = new Date(date);
  if (format === "relative") {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return d.toLocaleDateString("en-IN");
  }
  if (format === "long") {
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName) return "?";
  return `${firstName.charAt(0)}${lastName?.charAt(0) || ""}`.toUpperCase();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Inactive: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    Draft: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    Sent: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    Paid: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    PartiallyPaid: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Overdue: "text-red-400 bg-red-400/10 border-red-400/20",
    Cancelled: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    Refunded: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    Pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    Completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Failed: "text-red-400 bg-red-400/10 border-red-400/20",
    Ordered: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    PartiallyReceived: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Received: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Blocked: "text-red-400 bg-red-400/10 border-red-400/20",
    Suspended: "text-red-400 bg-red-400/10 border-red-400/20",
    PendingVerification: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    Individual: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    Business: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    Government: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };
  return colors[status] || "text-gray-400 bg-gray-400/10 border-gray-400/20";
}
