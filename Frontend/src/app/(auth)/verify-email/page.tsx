"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageLoading } from "@/components/ui/loading";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }
    authApi.verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Failed to verify email. The link may have expired.");
      });
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-dark rounded-2xl p-8 border border-surface-700/50 shadow-2xl text-center"
    >
      {status === "loading" && (
        <div className="py-8">
          <Loader2 className="h-16 w-16 animate-spin text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Verifying your email...</h1>
          <p className="text-surface-400 mt-2">Please wait while we verify your email address.</p>
        </div>
      )}

      {status === "success" && (
        <div className="py-8">
          <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
          <p className="text-surface-400 mt-2">{message}</p>
          <Button className="mt-6" onClick={() => router.push("/login")}>
            Sign In Now
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="py-8">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
          <p className="text-surface-400 mt-2">{message}</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/login">
              <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Login</Button>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
