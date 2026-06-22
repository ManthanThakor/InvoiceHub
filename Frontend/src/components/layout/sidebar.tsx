"use client";

import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/lib/stores/uiStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ShoppingCart,
  Truck,
  DollarSign,
  Wallet,
  TrendingUp,
  Settings,
  LogOut,
  Receipt,
  Shield,
  User,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { UserRole } from "@/types";
import { canManageUsers, canManageSettings } from "@/lib/utils/authorization";

function getMenuItems(userRole: UserRole | undefined) {
  return [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", minRole: UserRole.Viewer },
    { icon: FileText, label: "Invoices", href: "/invoices", minRole: UserRole.Viewer },
    { icon: Users, label: "Customers", href: "/customers", minRole: UserRole.Viewer },
    { icon: Package, label: "Products", href: "/products", minRole: UserRole.Viewer },
    { icon: Layers, label: "Categories", href: "/product-categories", minRole: UserRole.Viewer },
    { icon: ShoppingCart, label: "Purchase Orders", href: "/purchase-orders", minRole: UserRole.Viewer },
    { icon: Truck, label: "Suppliers", href: "/suppliers", minRole: UserRole.Viewer },
    { icon: Wallet, label: "Expenses", href: "/expenses", minRole: UserRole.Viewer },
    { icon: DollarSign, label: "Payments", href: "/payments", minRole: UserRole.Viewer },
    { icon: Receipt, label: "GST Reports", href: "/gst-reports", minRole: UserRole.Accountant },
    { icon: TrendingUp, label: "Insights", href: "/insights", minRole: UserRole.Manager },
    ...(canManageUsers(userRole) ? [{ icon: Shield as React.ElementType, label: "Users", href: "/users", minRole: UserRole.Admin }] : []),
  ].filter(item => {
    const hierarchy: Record<UserRole, number> = {
      [UserRole.SuperAdmin]: 100, [UserRole.Admin]: 80, [UserRole.Manager]: 60,
      [UserRole.Accountant]: 40, [UserRole.SalesAgent]: 20, [UserRole.Viewer]: 10,
    };
    return userRole ? hierarchy[userRole] >= hierarchy[item.minRole] : false;
  });
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logoutAsync } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const menuItems = getMenuItems(user?.role);

  const handleLogout = async () => {
    await logoutAsync();
    router.push("/login");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col glass-dark border-r border-surface-700/50 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-surface-700/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">IH</span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold text-white whitespace-nowrap"
              >
                InvoiceHub
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary-500/10 text-primary-400 neon-glow-primary"
                    : "text-surface-400 hover:text-white hover:bg-surface-800/50"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-500 rounded-full"
                  />
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-surface-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-surface-700">
                    {item.label}
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-surface-700/50 p-3 space-y-2">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            pathname === "/profile"
              ? "bg-primary-500/10 text-primary-400"
              : "text-surface-400 hover:text-white hover:bg-surface-800/50"
          )}
        >
          <User className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Profile</span>}
        </Link>
        {canManageSettings(user?.role) && (
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              pathname === "/settings"
                ? "bg-primary-500/10 text-primary-400"
                : "text-surface-400 hover:text-white hover:bg-surface-800/50"
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </Link>
        )}
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-surface-400 hover:text-red-400 hover:bg-surface-800/50 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
        </button>

        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 border-t border-surface-700/30 pt-3">
            <Avatar firstName={user.firstName} lastName={user.lastName} src={user.profilePicture} size="sm" />
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-surface-400 truncate capitalize">{user.role.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
}
