"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils/cn";
import { UserDto, UserRole, UserStatus } from "@/types";
import { motion } from "framer-motion";
import { Plus, Shield, Ban, CheckCircle, Edit, Trash2, Eye, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { roleBadgeColors, canDelete } from "@/lib/utils/authorization";
import { useAuthStore } from "@/lib/stores/authStore";

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { user: currentUser } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["users", page],
    queryFn: async () => { const res = await userApi.list(page, 10); return res.data.data; },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => userApi.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); toast.success("User status updated"); },
    onError: () => toast.error("Failed to update user status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); toast.success("User deleted"); },
    onError: () => toast.error("Failed to delete user"),
  });

  const columns: Column<UserDto>[] = [
    { key: "name", header: "Name", cell: (item) => (
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/users/${item.id}`)}>
        <div>
          <span className="font-medium text-white">{item.firstName} {item.lastName}</span>
          <p className="text-xs text-surface-400">{item.email}</p>
        </div>
      </div>
    )},
    { key: "role", header: "Role", cell: (item) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColors[item.role]}`}>
        <Shield className="h-3 w-3" />
        {item.role.replace(/([A-Z])/g, ' $1').trim()}
      </span>
    )},
    { key: "status", header: "Status", cell: (item) => <StatusBadge status={item.status} /> },
    { key: "phoneNumber", header: "Phone", cell: (item) => item.phoneNumber || "-" },
    { key: "lastLoginAt", header: "Last Login", cell: (item) => item.lastLoginAt ? formatDate(item.lastLoginAt, "relative") : "Never" },
    { key: "actions", header: "", cell: (item) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/users/${item.id}`)} title="View"><Eye className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={() => router.push(`/users/${item.id}/edit`)} title="Edit"><Edit className="h-4 w-4" /></Button>
        {item.status === UserStatus.Active ? (
          <Button variant="ghost" size="icon" className="text-amber-400 hover:text-amber-300" onClick={() => statusMutation.mutate({ id: item.id, status: UserStatus.Suspended })} title="Suspend">
            <Ban className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="text-emerald-400 hover:text-emerald-300" onClick={() => statusMutation.mutate({ id: item.id, status: UserStatus.Active })} title="Activate">
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        {canDelete(currentUser?.role) && currentUser?.id !== item.id && (
          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => { if (confirm("Delete this user?")) deleteMutation.mutate(item.id); }} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Users</h2>
          <p className="text-surface-400 text-sm mt-1">Manage team members and their roles</p>
        </div>
        <Button onClick={() => router.push("/users/new")} variant="glow"><UserPlus className="h-4 w-4 mr-2" /> Invite User</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={data?.items || []} isLoading={isLoading} page={page} pageSize={10}
            totalCount={data?.totalCount} onPageChange={setPage} keyExtractor={(item) => item.id} emptyMessage="No users found" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
