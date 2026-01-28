"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";

// Menu Item Types
type MenuDivider = {
  isDivider: true;
  label: string;
};

type MenuItem = {
  isDivider?: false;
  label: string;
  icon: React.ReactElement;
  href: string;
  badge?: number;
  children?: MenuItem[];
};

type MenuItemOrDivider = MenuItem | MenuDivider;

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Ambil data pengguna untuk cek role
  const { pengguna } = useAuthStore();

  // Cek apakah path aktif
  const isActive = (href: string) => pathname === href;

  // Helper untuk cek apakah user memiliki role tertentu
  const hasRole = (role: "penulis" | "editor" | "admin") => {
    if (!pengguna) return false;

    // Cek dari peran (format array string dari backend login)
    if (pengguna.peran && pengguna.peran.includes(role)) {
      return true;
    }

    // Cek dari peranPengguna (format lengkap)
    if (pengguna.peranPengguna) {
      return pengguna.peranPengguna.some(
        (peran) => peran.jenisPeran === role && peran.aktif,
      );
    }

    return false;
  };

  // Menu untuk Penulis
  const menuPenulis = [
    {
      label: "Beranda",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      href: "/penulis",
    },
    {
      label: "Ajukan Draf Baru",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      href: "/penulis/ajukan-draf",
    },
    {
      label: "Draf Saya",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: "/penulis/draf",
    },
    {
      label: "Buku Terbit",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      href: "/penulis/buku-terbit",
    },
    {
      label: "Paket Terbit",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      ),
      href: "/penulis/paket-terbit",
    },
    {
      label: "Pesanan Terbit",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      href: "/penulis/pesanan-terbit",
    },
  ];

  // Menu untuk Editor
  const menuEditor = [
    {
      label: "Dashboard Editor",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      href: "/editor",
    },
    {
      label: "Daftar Review",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      href: "/editor/review",
    },
  ];

  // Menu untuk Admin
  const menuAdmin = [
    {
      label: "Dashboard Admin",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      href: "/admin",
    },
    {
      label: "Semua Naskah",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: "/admin/review",
    },
    {
      label: "Antrian Review",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      href: "/admin/antrian-review",
    },
    {
      label: "Kelola Pengguna",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      href: "/admin/pengguna",
    },
    {
      label: "Monitoring Review",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      href: "/admin/monitoring",
    },
  ];

  // Gabungkan menu berdasarkan role
  const menuItems = [
    ...(hasRole("penulis") ? menuPenulis : []),
    ...(hasRole("editor") ? menuEditor : []),
    ...(hasRole("admin") ? menuAdmin : []),
  ];

  // Determine pengaturan href based on role
  const pengaturanHref = hasRole("admin")
    ? "/admin/pengaturan"
    : hasRole("editor")
      ? "/editor/pengaturan"
      : "/penulis/pengaturan";

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle Menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay untuk mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0d7377] to-[#0a5c5f] text-white transition-all duration-300 z-40 ${
          isCollapsed ? "w-20" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}
      >
        {/* Logo & Toggle */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <>
                <Link href="/" className="flex items-center gap-3 group">
                  <Image
                    src="/logo.png"
                    alt="Publishify Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10 transition-transform group-hover:scale-110"
                  />
                  <span className="text-xl font-bold">Publishify</span>
                </Link>
                {/* Toggle Button - Desktop Only */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Toggle Sidebar"
                  title="Tutup Sidebar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                    />
                  </svg>
                </button>
              </>
            )}
            {isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <Link href="/" className="mx-auto">
                  <Image
                    src="/logo.png"
                    alt="Publishify Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </Link>
                {/* Toggle Button - Collapsed State */}
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors absolute right-3"
                  aria-label="Toggle Sidebar"
                  title="Buka Sidebar"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2 pb-4">
            {menuItems.map((item, index) => {
              // Render divider with type guard
              if ("isDivider" in item && item.isDivider) {
                return (
                  <li key={index} className="pt-4 pb-2">
                    {!isCollapsed && (
                      <div className="px-4">
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                          {item.label}
                        </p>
                      </div>
                    )}
                    {isCollapsed && (
                      <div className="border-t border-white/20 mx-2"></div>
                    )}
                  </li>
                );
              }

              // Render normal menu item
              const menuItem = item as MenuItem;
              const itemIsActive = pathname === menuItem.href;
              return (
                <li key={index}>
                  <Link
                    href={menuItem.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                      itemIsActive
                        ? "bg-[#14b8a6] text-white shadow-lg"
                        : "hover:bg-white/10 text-white/80 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? menuItem.label : ""}
                  >
                    {menuItem.icon}
                    {!isCollapsed && (
                      <span className="font-medium flex-1">
                        {menuItem.label}
                      </span>
                    )}
                    {/* Notification Badge */}
                    {menuItem.badge && menuItem.badge > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                        {menuItem.badge > 99 ? "99+" : menuItem.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bagian bawah sidebar */}
        <div className="flex-shrink-0 border-t border-white/10 px-3 py-4">
          <div className="flex items-center justify-center text-xs text-white/60">
            Publishify v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}
