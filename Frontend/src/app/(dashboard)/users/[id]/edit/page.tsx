"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import { UserRole, UserStatus } from "@/types";

const roleOptions = Object.values(UserRole).map((r) => ({ value: r, label: r.replace(/([A-Z])/g, ' $1').trim() }));
const statusOptions = Object.values(UserStatus).map((s) => ({ value: s, label: s }));

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", params.id],
    queryFn: async () => { const res = await userApi.getById(params.id); return res.data.data; },
    enabled: !!params.id,
  });

  const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "", role: UserRole.Viewer, status: UserStatus.Active });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || "",
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () => userApi.update(params.id, {
      firstName: form.firstName,
      lastName: form.lastName,
      phoneNumber: form.phoneNumber || undefined,
      role: form.role as UserRole,
      status: form.status as UserStatus,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", params.id] });
      toast.success("User updated successfully");
      router.push(`/users/${params.id}`);
    },
    onError: () => toast.error("Failed to update user"),
  });

  if (isLoading) return <PageLoading />;
  if (!user) return <div className="text-center text-surface-400 py-12">User not found</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Edit User</h2>
          <p className="text-surface-400 text-sm">Update user details and permissions</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <Input label="Email" value={user.email} readOnly disabled />
          <Input label="Phone Number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <Select label="Role" options={roleOptions} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} />
          <Select label="Status" options={statusOptions} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
        <Button variant="glow" isLoading={updateMutation.isPending} onClick={() => updateMutation.mutate()}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </div>
    </motion.div>
  );
}
