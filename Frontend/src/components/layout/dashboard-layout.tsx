"use client";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useUIStore } from "@/lib/stores/uiStore";
import { cn } from "@/lib/utils/cn";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useEffect } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (isMobile) {
      useUIStore.getState().setSidebarOpen(false);
    } else {
      useUIStore.getState().setSidebarOpen(true);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:ml-[260px]" : "md:ml-[72px]"
        )}
      >
        <Navbar />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
