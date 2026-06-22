"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { userApi, authApi } from "@/lib/api/endpoints";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Camera, Upload, Trash2, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await userApi.uploadProfilePicture(file);
      if (user) {
        setUser({ ...user, profilePicture: res.data.data });
      }
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await userApi.deleteProfilePicture();
      if (user) {
        setUser({ ...user, profilePicture: undefined });
      }
      toast.success("Profile picture removed");
    } catch {
      toast.error("Failed to remove photo");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("All password fields are required"); return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters"); return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match"); return;
    }
    setChangingPassword(true);
    try {
      await authApi.changePassword(passwordForm);
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar firstName={user?.firstName} lastName={user?.lastName} src={user?.profilePicture} size="xl" />
              <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="h-5 w-5 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleUploadPhoto} disabled={uploading} />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{user?.firstName} {user?.lastName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="primary">{user?.role}</Badge>
                <Badge variant={user?.status === "Active" ? "success" : "warning"}>{user?.status}</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={user?.firstName || ""} readOnly />
            <Input label="Last Name" value={user?.lastName || ""} readOnly />
            <Input label="Email" value={user?.email || ""} readOnly />
            <Input label="Phone" value={user?.phoneNumber || ""} readOnly />
          </div>

          {user?.profilePicture && (
            <Button variant="danger" size="sm" onClick={handleDeletePhoto}>
              <Trash2 className="h-4 w-4 mr-2" /> Remove Photo
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            placeholder="Enter current password"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Min. 6 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Repeat new password"
            />
          </div>
          <Button variant="glow" onClick={handleChangePassword} isLoading={changingPassword}>
            <Lock className="h-4 w-4 mr-2" /> Change Password
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
