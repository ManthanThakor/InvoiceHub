"use client";

import { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/lib/stores/uiStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Users, Package, ShoppingCart, Truck, Wallet, DollarSign, LayoutDashboard, Settings, TrendingUp, Layers, Command } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const searchItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: FileText, label: "Create Invoice", href: "/invoices/new" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Users, label: "Add Customer", href: "/customers/new" },
  { icon: Package, label: "Products", href: "/products" },
  { icon: Package, label: "Add Product", href: "/products/new" },
  { icon: Layers, label: "Categories", href: "/product-categories" },
  { icon: Layers, label: "Add Category", href: "/product-categories/new" },
  { icon: ShoppingCart, label: "Purchase Orders", href: "/purchase-orders" },
  { icon: Truck, label: "Suppliers", href: "/suppliers" },
  { icon: Wallet, label: "Expenses", href: "/expenses" },
  { icon: DollarSign, label: "Payments", href: "/payments" },
  { icon: TrendingUp, label: "Insights", href: "/insights" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredItems = searchItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.href.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      router.push(filteredItems[selectedIndex].href);
      setCommandPaletteOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-lg glass-dark rounded-2xl border border-surface-700/50 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-700/50">
              <Search className="h-5 w-5 text-surface-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages..."
                className="flex-1 bg-transparent text-white placeholder:text-surface-400 focus:outline-none text-sm"
              />
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-surface-800 text-[10px] font-mono text-surface-500 border border-surface-700">
                ESC
              </kbd>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <p className="text-center py-8 text-surface-500 text-sm">No results found</p>
              ) : (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setCommandPaletteOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
                        index === selectedIndex
                          ? "bg-primary-500/10 text-primary-400"
                          : "text-surface-300 hover:bg-surface-800/50 hover:text-white"
                      )}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
