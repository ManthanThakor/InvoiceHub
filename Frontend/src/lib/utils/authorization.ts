import { UserRole } from "@/types";

// Role hierarchy: SuperAdmin > Admin > Manager > Accountant > SalesAgent > Viewer
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.SuperAdmin]: 100,
  [UserRole.Admin]: 80,
  [UserRole.Manager]: 60,
  [UserRole.Accountant]: 40,
  [UserRole.SalesAgent]: 20,
  [UserRole.Viewer]: 10,
};

export function hasPermission(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function isAtLeast(userRole: UserRole | undefined, minimumRole: UserRole): boolean {
  return hasPermission(userRole, minimumRole);
}

// Specific permission checks
export function canManageUsers(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.Admin);
}

export function canManageInvoices(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.SalesAgent);
}

export function canManageCustomers(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.SalesAgent);
}

export function canManageProducts(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.Manager);
}

export function canManagePurchaseOrders(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.Manager);
}

export function canManageExpenses(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.Accountant);
}

export function canViewReports(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.Accountant);
}

export function canManageSettings(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.Admin);
}

export function canDelete(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.Admin);
}

export function canViewAuditLogs(userRole: UserRole | undefined): boolean {
  return isAtLeast(userRole, UserRole.Admin);
}

export const roleBadgeColors: Record<UserRole, string> = {
  [UserRole.SuperAdmin]: "bg-red-500/10 text-red-400 border-red-500/30",
  [UserRole.Admin]: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  [UserRole.Manager]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  [UserRole.Accountant]: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  [UserRole.SalesAgent]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  [UserRole.Viewer]: "bg-surface-500/10 text-surface-400 border-surface-500/30",
};
