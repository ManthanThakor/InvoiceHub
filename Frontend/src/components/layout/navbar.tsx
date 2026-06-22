"use client";

import { cn } from "@/lib/utils/cn";
import { useUIStore } from "@/lib/stores/uiStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/invoices": "Invoices",
  "/invoices/new": "Create Invoice",
  "/customers": "Customers",
  "/customers/new": "Add Customer",
  "/products": "Products",
  "/products/new": "Add Product",
  "/product-categories": "Categories",
  "/product-categories/new": "Add Category",
  "/purchase-orders": "Purchase Orders",
  "/purchase-orders/new": "Create Purchase Order",
  "/suppliers": "Suppliers",
  "/suppliers/new": "Add Supplier",
  "/expenses": "Expenses",
  "/expenses/new": "Add Expense",
  "/payments": "Payments",
  "/payments/new": "Record Payment",
  "/gst-reports": "GST Reports",
  "/users": "Users",
  "/users/new": "Invite User",
  "/insights": "AI Insights",
  "/settings": "Settings",
  "/profile": "Profile",
};

export function Navbar() {
  const { sidebarOpen, toggleSidebar, setCommandPaletteOpen } = useUIStore();
  const { user, logoutAsync } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Find best matching title
  const title = Object.entries(pageTitles).find(([key]) => {
    if (key === pathname) return true;
    if (pathname.startsWith(key) && key !== "/") return true;
    return false;
  })?.[1] || "Dashboard";

  const handleLogout = async () => {
    await logoutAsync();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-surface-700/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Search */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-700 bg-surface-900/50 text-surface-400 text-sm hover:border-surface-600 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-800 text-[10px] font-mono text-surface-500">Ctrl+K</kbd>
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="md:hidden p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800/50 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-surface-900" />
          </button>

          {/* Profile */}
          {user && (
            <DropdownMenu
              trigger={
                <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-800/50 transition-colors cursor-pointer">
                  <Avatar firstName={user.firstName} lastName={user.lastName} src={user.profilePicture} size="sm" />
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-white leading-tight">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-surface-400 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="hidden lg:block h-4 w-4 text-surface-400" />
                </div>
              }
            >
              <DropdownMenuItem onClick={() => router.push("/profile")} icon={<User className="h-4 w-4" />}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")} icon={<Settings className="h-4 w-4" />}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} icon={<LogOut className="h-4 w-4" />} danger>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
