"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { PageLoading } from "@/components/ui/loading";

const resetSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type ResetForm = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { register, handleSubmit, formState: { errors } } = useForm<ResetForm>({ resolver: zodResolver(resetSchema) as any });

  const onSubmit = async (data: ResetForm) => {
    if (!token) { toast.error("Invalid reset token"); return; }
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword, confirmPassword: data.confirmPassword });
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-dark rounded-2xl p-8 border border-surface-700/50 shadow-2xl"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Reset your password</h1>
        <p className="text-surface-400 mt-1">Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input label="New Password" type={showPassword ? "text" : "password"} placeholder="Enter new password" icon={<Lock className="h-4 w-4" />} error={errors.newPassword?.message} {...register("newPassword")} rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-surface-400 hover:text-surface-200">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          } />
        </div>
        <Input label="Confirm Password" type="password" placeholder="Confirm new password" icon={<Lock className="h-4 w-4" />} error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>Reset Password</Button>
      </form>

      <p className="text-center text-sm text-surface-400 mt-6">
        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to login</Link>
      </p>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
