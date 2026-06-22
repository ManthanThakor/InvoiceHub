"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PageLoading } from "@/components/ui/loading";
import { formatDate } from "@/lib/utils/cn";
import { roleBadgeColors } from "@/lib/utils/authorization";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Edit, Mail, Phone, Calendar, Clock } from "lucide-react";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", params.id],
    queryFn: async () => { const res = await userApi.getById(params.id); return res.data.data; },
    enabled: !!params.id,
  });

  if (isLoading) return <PageLoading />;
  if (!user) return <div className="text-center text-surface-400 py-12">User not found</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h2 className="text-2xl font-bold text-white">User Detail</h2>
            <p className="text-surface-400 text-sm">View team member information</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push(`/users/${user.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 mb-6">
            <Avatar firstName={user.firstName} lastName={user.lastName} src={user.profilePicture} size="xl" />
            <div>
              <h3 className="text-xl font-bold text-white">{user.firstName} {user.lastName}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleBadgeColors[user.role]}`}>
                  <Shield className="h-3 w-3" />
                  {user.role.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-surface-800/30 border border-surface-700/30">
              <div className="flex items-center gap-2 text-surface-400 text-xs mb-1">
                <Mail className="h-3.5 w-3.5" /> Email
              </div>
              <p className="text-sm text-white">{user.email}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/30 border border-surface-700/30">
              <div className="flex items-center gap-2 text-surface-400 text-xs mb-1">
                <Phone className="h-3.5 w-3.5" /> Phone
              </div>
              <p className="text-sm text-white">{user.phoneNumber || "-"}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/30 border border-surface-700/30">
              <div className="flex items-center gap-2 text-surface-400 text-xs mb-1">
                <Calendar className="h-3.5 w-3.5" /> Last Login
              </div>
              <p className="text-sm text-white">{user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/30 border border-surface-700/30">
              <div className="flex items-center gap-2 text-surface-400 text-xs mb-1">
                <Clock className="h-3.5 w-3.5" /> User ID
              </div>
              <p className="text-sm text-white font-mono">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
