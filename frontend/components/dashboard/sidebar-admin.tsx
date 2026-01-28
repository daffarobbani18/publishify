"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Eye,
  BookCheck,
  Library,
  BookOpen,
  Tags,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Package,
} from "lucide-react";

// Interface untuk menu item
interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: MenuItem[];
}

// Interface untuk menu section
interface MenuSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
  defaultOpen?: boolean;
}

export function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([
    "Manajemen Naskah",
  ]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { pengguna, logout } = useAuthStore();

  // Toggle section
  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title],
    );
  };

  // Cek apakah path aktif
  const isActive = (href: string) => pathname === href;
  const isSectionActive = (items: MenuItem[]) =>
    items.some((item) => item.href && pathname === item.href);

  // Menu Sections untuk Admin
  const menuSections: MenuSection[] = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      items: [
        {
          label: "Overview",
          icon: <LayoutDashboard className="w-4 h-4" />,
          href: "/admin",
        },
      ],
      defaultOpen: true,
    },
    {
      title: "Manajemen Naskah",
      icon: <FileText className="w-5 h-5" />,
      items: [
        {
          label: "Antrean Review",
          icon: <ClipboardList className="w-4 h-4" />,
          href: "/admin/antrian-review",
        },
        {
          label: "Monitoring Review",
          icon: <Eye className="w-4 h-4" />,
          href: "/admin/monitoring",
        },
        {
          label: "Naskah Siap Terbit",
          icon: <BookCheck className="w-4 h-4" />,
          href: "/admin/naskah-siap-terbit",
        },
        {
          label: "Semua Naskah",
          icon: <Library className="w-4 h-4" />,
          href: "/admin/review",
        },
      ],
      defaultOpen: true,
    },
    {
      title: "Katalog Buku",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        {
          label: "Buku Terbit",
          icon: <BookOpen className="w-4 h-4" />,
          href: "/admin/buku",
        },
        {
          label: "Master Kategori",
          icon: <Tags className="w-4 h-4" />,
          href: "/admin/master/kategori",
        },
      ],
    },
    {
      title: "Penerbitan",
      icon: <Package className="w-5 h-5" />,
      items: [
        {
          label: "Pesanan Terbit",
          icon: <Package className="w-4 h-4" />,
          href: "/admin/pesanan-terbit",
        },
      ],
    },
    {
      title: "Manajemen Pengguna",
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          label: "Kelola Pengguna",
          icon: <Users className="w-4 h-4" />,
          href: "/admin/pengguna",
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    router.push("/");
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const active = item.href ? isActive(item.href) : false;

    if (item.href) {
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setIsMobileOpen(false)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
            active
              ? "bg-[#14b8a6] text-white shadow-lg"
              : "hover:bg-white/10 text-white/70 hover:text-white"
          } ${isCollapsed ? "justify-center px-2" : ""}`}
          title={isCollapsed ? item.label : ""}
        >
          {item.icon}
          {!isCollapsed && <span className="font-medium">{item.label}</span>}
        </Link>
      );
    }

    return null;
  };

  // Render menu section
  const renderSection = (section: MenuSection) => {
    const isOpen = openSections.includes(section.title) || isCollapsed;
    const sectionActive = isSectionActive(section.items);

    return (
      <div key={section.title} className="mb-2">
        {/* Section Header */}
        <button
          onClick={() => !isCollapsed && toggleSection(section.title)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
            sectionActive
              ? "bg-white/10 text-white"
              : "hover:bg-white/10 text-white/70 hover:text-white"
          } ${isCollapsed ? "justify-center px-2" : ""}`}
          title={isCollapsed ? section.title : ""}
        >
          <div className="flex items-center gap-3">
            {section.icon}
            {!isCollapsed && (
              <span className="font-semibold text-sm">{section.title}</span>
            )}
          </div>
          {!isCollapsed && (
            <span className="transition-transform duration-200">
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
        </button>

        {/* Section Items */}
        {(isOpen || isCollapsed) && (
          <div
            className={`mt-1 space-y-1 ${
              !isCollapsed ? "ml-2 border-l-2 border-white/10" : ""
            }`}
          >
            {section.items.map((item) => renderMenuItem(item, 1))}
          </div>
        )}
      </div>
    );
  };

  // Sidebar Content
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo & Toggle */}
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
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
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            </>
          ) : (
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
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-white/20">
        {menuSections.map(renderSection)}
      </nav>

      {/* Bagian bawah sidebar: info versi aplikasi */}
      <div className="flex-shrink-0 border-t border-white/10 px-3 py-4">
        <div className="flex items-center justify-center text-xs text-white/60">
          Publishify v1.0.0
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle Menu"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
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
        <SidebarContent />
      </aside>
    </>
  );
}
