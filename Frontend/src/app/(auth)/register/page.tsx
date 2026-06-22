"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/endpoints";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, Phone, Building2, Eye, EyeOff, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    createCompany: z.boolean().optional(),
    companyName: z.string().optional(),
    gstin: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { createCompany: true },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        createCompany: true,
        companyName: data.companyName,
        gstin: data.gstin,
        phoneNumber: data.phoneNumber,
      });
      const { accessToken, refreshToken, user } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success("Account created successfully!");
      router.push("/invoices");
    } catch (error: any) {
      const data = error.response?.data;
      const msg = data?.message || data?.title || (data?.errors?.length ? data.errors.join(", ") : "") || error.message || "Registration failed";
      toast.error(msg);
      console.error("Registration error:", data || error);
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
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
          <span className="text-white font-bold text-xl">IH</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-surface-400 mt-1">Start your GST-compliant invoicing journey</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" placeholder="John" icon={<User className="h-4 w-4" />} error={errors.firstName?.message} {...register("firstName")} />
          <Input label="Last Name" placeholder="Doe" icon={<User className="h-4 w-4" />} error={errors.lastName?.message} {...register("lastName")} />
        </div>
        <Input label="Email" type="email" placeholder="you@company.com" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register("email")} />
        <Input label="Phone" type="tel" placeholder="+91 98765 43210" icon={<Phone className="h-4 w-4" />} error={errors.phoneNumber?.message} {...register("phoneNumber")} />
        <Input label="Company Name" placeholder="Your Business Name" icon={<Building2 className="h-4 w-4" />} error={errors.companyName?.message} {...register("companyName")} />
        <Input label="GSTIN (Optional)" placeholder="22AAAAA0000A1Z5" {...register("gstin")} />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register("password")}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-surface-400 hover:text-surface-200">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>
        <Input label="Confirm Password" type="password" placeholder="Confirm your password" icon={<Lock className="h-4 w-4" />} error={errors.confirmPassword?.message} {...register("confirmPassword")} />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Create Account
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <p className="text-center text-sm text-surface-400 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
