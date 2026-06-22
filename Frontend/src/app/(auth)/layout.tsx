"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { PageLoading } from "@/components/ui/loading";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/invoices");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return <PageLoading />;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      <div className="relative w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  );
}
