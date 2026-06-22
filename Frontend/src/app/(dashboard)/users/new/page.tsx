"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { UserRole } from "@/types";

const inviteSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
  phoneNumber: z.string().optional(),
  role: z.nativeEnum(UserRole),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type InviteForm = z.infer<typeof inviteSchema>;

const roleOptions = Object.values(UserRole).map((r) => ({ value: r, label: r.replace(/([A-Z])/g, ' $1').trim() }));

export default function NewUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema) as any,
    defaultValues: { role: UserRole.SalesAgent },
  });

  const onSubmit = async (data: InviteForm) => {
    setIsLoading(true);
    try {
      await userApi.create(data);
      toast.success("User invited successfully");
      router.push("/users");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to invite user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Invite User</h2>
          <p className="text-surface-400 text-sm">Add a new team member to your organization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Enter the details of the new team member</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name *" placeholder="John" error={errors.firstName?.message} {...register("firstName")} />
              <Input label="Last Name *" placeholder="Doe" error={errors.lastName?.message} {...register("lastName")} />
            </div>
            <Input label="Email *" type="email" placeholder="john@example.com" error={errors.email?.message} {...register("email")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Password *" type="password" placeholder="Min. 6 characters" error={errors.password?.message} {...register("password")} />
              <Input label="Confirm Password *" type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            </div>
            <Input label="Phone Number" placeholder="+91 98765 43210" error={errors.phoneNumber?.message} {...register("phoneNumber")} />
            <Select label="Role *" options={roleOptions} error={errors.role?.message} {...register("role")} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" variant="glow" isLoading={isLoading}>
            <UserPlus className="h-4 w-4 mr-2" /> Invite User
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
