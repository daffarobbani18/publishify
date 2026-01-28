"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogOut, User, Bell, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserHeaderProps {
  userName?: string;
  userRole?: string;
  className?: string;
}

/**
 * Komponen Header untuk semua user
 * Menampilkan nama user dan button logout
 * Konsisten dengan design system teal/cyan gradient
 */
export function UserHeader({
  userName,
  userRole,
  className = "",
}: UserHeaderProps) {
  const router = useRouter();
  const { pengguna, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Berhasil logout");
    router.push("/login");
  };

  // Default values dari auth store jika tidak disediakan
  const displayName =
    userName ||
    pengguna?.profilPengguna?.namaTampilan ||
    `${pengguna?.profilPengguna?.namaDepan || ""} ${pengguna?.profilPengguna?.namaBelakang || ""}`.trim() ||
    pengguna?.email?.split("@")[0] ||
    "Pengguna";

  const displayRole = (userRole ||
    (Array.isArray(pengguna?.peran) ? pengguna?.peran[0] : pengguna?.peran) ||
    "penulis") as "penulis" | "editor" | "admin";

  // Role labels
  const roleLabels: Record<"penulis" | "editor" | "admin", string> = {
    penulis: "Penulis",
    editor: "Editor",
    admin: "Administrator",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border-b border-slate-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: User Info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 items-center justify-center text-white font-semibold text-sm shadow-lg shadow-teal-500/20">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                {displayName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {roleLabels[displayRole] || displayRole}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Button */}
            <Button
              variant="ghost"
              size="sm"
              className="relative hover:bg-slate-100"
              onClick={() => toast.info("Fitur notifikasi segera hadir")}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Dropdown - Contains logout option */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-100 flex items-center gap-1"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  <span className="hidden sm:inline ml-1 text-sm text-slate-700">
                    Akun
                  </span>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {pengguna?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(`/${displayRole}/profil`)}
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profil Saya
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/${displayRole}/pengaturan`)}
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  Pengaturan Akun
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowLogoutModal(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all animate-in zoom-in-95">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <LogOut className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Yakin ingin keluar?
              </h2>
              <p className="text-gray-600">
                Sesi Anda akan berakhir dan Anda harus login kembali untuk
                mengakses dashboard.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
