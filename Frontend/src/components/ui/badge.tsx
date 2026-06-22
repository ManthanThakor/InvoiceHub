import { cn } from "@/lib/utils/cn";
import { getStatusColor } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 border",
  {
    variants: {
      variant: {
        default: "border-surface-700 text-surface-300 bg-surface-800/50",
        primary: "border-primary-500/30 text-primary-400 bg-primary-500/10",
        success: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
        warning: "border-amber-500/30 text-amber-400 bg-amber-500/10",
        danger: "border-red-500/30 text-red-400 bg-red-500/10",
        info: "border-blue-500/30 text-blue-400 bg-blue-500/10",
        purple: "border-purple-500/30 text-purple-400 bg-purple-500/10",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ className, variant, size, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colorClass = getStatusColor(status);
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border", colorClass)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {status === "PartiallyPaid" ? "Partially Paid" : 
       status === "PartiallyReceived" ? "Partially Received" :
       status === "PendingVerification" ? "Pending Verification" :
       status.replace(/([A-Z])/g, ' $1').trim()}
    </span>
  );
}
