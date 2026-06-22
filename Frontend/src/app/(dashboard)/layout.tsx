"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CommandPalette } from "@/components/layout/command-palette";
import { PageLoading } from "@/components/ui/loading";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <PageLoading />;
  }

  return (
    <DashboardLayout>
      <CommandPalette />
      {children}
    </DashboardLayout>
  );
}
