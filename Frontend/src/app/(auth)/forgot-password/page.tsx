"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) as any });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data);
      setSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
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
        <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
        <p className="text-surface-400 mt-1">{sent ? "Check your email for the reset link" : "Enter your email and we'll send you a reset link"}</p>
      </div>

      {sent ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
            <Send className="h-8 w-8" />
          </div>
          <p className="text-sm text-surface-400 mb-6">If an account exists with that email, you'll receive a password reset link shortly.</p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" placeholder="you@company.com" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register("email")} />
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Send Reset Link
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-surface-400 mt-6">
        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to login
        </Link>
      </p>
    </motion.div>
  );
}
