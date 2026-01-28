"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/client";
import {
  BookOpen,
  Clock,
  ClipboardCheck,
  Users,
  FileText,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Settings,
  Eye,
  BookMarked,
  UserCheck,
  Activity,
  ArrowUpRight,
  Calendar,
  RefreshCw,
} from "lucide-react";

// ================================
// INTERFACES
// ================================

interface StatistikAdmin {
  totalNaskah: number;
  naskahDiajukan: number;
  naskahDalamReview: number;
  naskahDisetujui: number;
  naskahDiterbitkan: number;
  totalEditor: number;
  totalPenulis: number;
  reviewAktif: number;
}

interface AktivitasTerbaru {
  id: string;
  tipe: "naskah" | "review" | "pengguna";
  judul: string;
  penulis?: string;
  waktu: string;
  status: string;
}

// ================================
// MAIN COMPONENT
// ================================

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistik, setStatistik] = useState<StatistikAdmin>({
    totalNaskah: 0,
    naskahDiajukan: 0,
    naskahDalamReview: 0,
    naskahDisetujui: 0,
    naskahDiterbitkan: 0,
    totalEditor: 0,
    totalPenulis: 0,
    reviewAktif: 0,
  });
  const [aktivitasTerbaru, setAktivitasTerbaru] = useState<AktivitasTerbaru[]>(
    [],
  );

  useEffect(() => {
    fetchStatistik();
  }, []);

  const fetchStatistik = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const results = await Promise.allSettled([
        api
          .get("/naskah/admin/semua", { params: { limit: 100 } })
          .catch(() => ({ data: { data: [] } })),
        api.get("/pengguna").catch(() => ({ data: { data: [] } })),
        api.get("/review").catch(() => ({ data: { data: [] } })),
      ]);

      const naskahList =
        results[0].status === "fulfilled" && results[0].value?.data?.data
          ? results[0].value.data.data
          : [];

      const penggunaList =
        results[1].status === "fulfilled" && results[1].value?.data?.data
          ? results[1].value.data.data
          : [];

      const reviewList =
        results[2].status === "fulfilled" && results[2].value?.data?.data
          ? results[2].value.data.data
          : [];

      setStatistik({
        totalNaskah: naskahList.length,
        naskahDiajukan: naskahList.filter((n: any) => n.status === "diajukan")
          .length,
        naskahDalamReview: naskahList.filter(
          (n: any) => n.status === "dalam_review",
        ).length,
        naskahDisetujui: naskahList.filter((n: any) => n.status === "disetujui")
          .length,
        naskahDiterbitkan: naskahList.filter(
          (n: any) => n.status === "diterbitkan",
        ).length,
        totalEditor: penggunaList.filter((u: any) =>
          u.peranPengguna?.some(
            (p: any) => p.jenisPeran === "editor" && p.aktif,
          ),
        ).length,
        totalPenulis: penggunaList.filter((u: any) =>
          u.peranPengguna?.some(
            (p: any) => p.jenisPeran === "penulis" && p.aktif,
          ),
        ).length,
        reviewAktif: reviewList.filter(
          (r: any) => r.status === "ditugaskan" || r.status === "dalam_proses",
        ).length,
      });

      // Generate aktivitas terbaru dari naskah
      const aktivitas: AktivitasTerbaru[] = naskahList
        .slice(0, 5)
        .map((n: any) => ({
          id: n.id,
          tipe: "naskah" as const,
          judul: n.judul,
          penulis:
            n.penulis?.profilPengguna?.namaDepan ||
            n.penulis?.email?.split("@")[0] ||
            "Anonim",
          waktu: formatWaktu(n.diperbaruiPada || n.dibuatPada),
          status: n.status,
        }));
      setAktivitasTerbaru(aktivitas);
    } catch (error) {
      console.error("Error fetching statistik:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatWaktu = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft" },
      diajukan: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "Diajukan",
      },
      dalam_review: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Review",
      },
      perlu_revisi: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        label: "Revisi",
      },
      disetujui: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Disetujui",
      },
      diterbitkan: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        label: "Terbit",
      },
      ditolak: { bg: "bg-red-100", text: "text-red-700", label: "Ditolak" },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  // Kartu statistik
  const statsCards = [
    {
      title: "Total Naskah",
      value: statistik.totalNaskah,
      icon: FileText,
      bgColor: "bg-blue-500",
      link: "/admin/review",
    },
    {
      title: "Menunggu Review",
      value: statistik.naskahDiajukan,
      icon: Clock,
      bgColor: "bg-amber-500",
      link: "/admin/antrian-review",
      highlight: statistik.naskahDiajukan > 0,
    },
    {
      title: "Dalam Review",
      value: statistik.naskahDalamReview,
      icon: ClipboardCheck,
      bgColor: "bg-purple-500",
      link: "/admin/monitoring",
    },
    {
      title: "Siap Terbit",
      value: statistik.naskahDisetujui,
      icon: CheckCircle2,
      bgColor: "bg-green-500",
      link: "/admin/naskah-siap-terbit",
      highlight: statistik.naskahDisetujui > 0,
    },
    {
      title: "Sudah Terbit",
      value: statistik.naskahDiterbitkan,
      icon: BookMarked,
      bgColor: "bg-emerald-500",
      link: "/admin/buku",
    },
    {
      title: "Review Aktif",
      value: statistik.reviewAktif,
      icon: Activity,
      bgColor: "bg-teal-500",
      link: "/admin/monitoring",
    },
  ];

  // Menu aksi cepat
  const quickActions = [
    {
      title: "Antrean Review",
      description: `${statistik.naskahDiajukan} naskah menunggu`,
      icon: Clock,
      color: "amber",
      link: "/admin/antrian-review",
    },
    {
      title: "Monitoring Review",
      description: `${statistik.reviewAktif} review aktif`,
      icon: Eye,
      color: "blue",
      link: "/admin/monitoring",
    },
    {
      title: "Naskah Siap Terbit",
      description: `${statistik.naskahDisetujui} siap dipublikasi`,
      icon: BookOpen,
      color: "green",
      link: "/admin/naskah-siap-terbit",
    },
    {
      title: "Katalog Buku",
      description: `${statistik.naskahDiterbitkan} buku terbit`,
      icon: BookMarked,
      color: "emerald",
      link: "/admin/buku",
    },
    {
      title: "Kelola Pengguna",
      description: `${statistik.totalPenulis + statistik.totalEditor} pengguna`,
      icon: Users,
      color: "purple",
      link: "/admin/pengguna",
    },
    {
      title: "Pengaturan",
      description: "Konfigurasi sistem",
      icon: Settings,
      color: "gray",
      link: "/admin/pengaturan",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<
      string,
      { border: string; bg: string; text: string; hover: string }
    > = {
      amber: {
        border: "border-amber-200",
        bg: "bg-amber-50",
        text: "text-amber-600",
        hover: "hover:border-amber-400",
      },
      blue: {
        border: "border-blue-200",
        bg: "bg-blue-50",
        text: "text-blue-600",
        hover: "hover:border-blue-400",
      },
      green: {
        border: "border-green-200",
        bg: "bg-green-50",
        text: "text-green-600",
        hover: "hover:border-green-400",
      },
      emerald: {
        border: "border-emerald-200",
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        hover: "hover:border-emerald-400",
      },
      purple: {
        border: "border-purple-200",
        bg: "bg-purple-50",
        text: "text-purple-600",
        hover: "hover:border-purple-400",
      },
      gray: {
        border: "border-gray-200",
        bg: "bg-gray-50",
        text: "text-gray-600",
        hover: "hover:border-gray-400",
      },
      indigo: {
        border: "border-indigo-200",
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        hover: "hover:border-indigo-400",
      },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Header with Gradient */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
                <Settings className="h-6 w-6 sm:h-7 sm:w-7" />
                Dashboard Admin
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Kelola seluruh sistem penerbitan dengan mudah
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:flex items-center gap-3">
              <button
                onClick={() => fetchStatistik(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Updated Design */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <button
                key={index}
                onClick={() => router.push(card.link)}
                className={`bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all text-left group relative ${
                  card.highlight ? "ring-2 ring-amber-400 ring-offset-2" : ""
                }`}
              >
                {card.highlight && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                      {loading ? "..." : card.value}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">
                      {card.title}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Aksi Cepat */}
          <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600" />
              Aksi Cepat
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const colors = getColorClasses(action.color);
                return (
                  <button
                    key={index}
                    onClick={() => router.push(action.link)}
                    className={`flex flex-col p-3 sm:p-4 border-2 ${colors.border} rounded-lg ${colors.hover} hover:shadow-md transition-all group text-left`}
                  >
                    <div
                      className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ringkasan Pengguna */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              Ringkasan Pengguna
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Penulis
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {loading ? "..." : statistik.totalPenulis}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Editor
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {loading ? "..." : statistik.totalEditor}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push("/admin/pengguna")}
              className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Lihat semua pengguna
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Aktivitas Terbaru & Status Naskah */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Aktivitas Terbaru */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              Aktivitas Terbaru
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : aktivitasTerbaru.length > 0 ? (
              <div className="space-y-3">
                {aktivitasTerbaru.map((aktivitas) => (
                  <button
                    key={aktivitas.id}
                    onClick={() => router.push(`/admin/review`)}
                    className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate group-hover:text-teal-600 transition-colors">
                        {aktivitas.judul}
                      </p>
                      <p className="text-xs text-slate-500">
                        oleh {aktivitas.penulis} • {aktivitas.waktu}
                      </p>
                    </div>
                    {getStatusBadge(aktivitas.status)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-sm">Belum ada aktivitas</p>
              </div>
            )}
          </div>

          {/* Status Naskah */}
          <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Distribusi Status Naskah
            </h2>
            <div className="space-y-4">
              {/* Progress bars */}
              {[
                {
                  label: "Diajukan",
                  value: statistik.naskahDiajukan,
                  color: "bg-amber-500",
                },
                {
                  label: "Dalam Review",
                  value: statistik.naskahDalamReview,
                  color: "bg-blue-500",
                },
                {
                  label: "Disetujui",
                  value: statistik.naskahDisetujui,
                  color: "bg-green-500",
                },
                {
                  label: "Diterbitkan",
                  value: statistik.naskahDiterbitkan,
                  color: "bg-emerald-500",
                },
              ].map((item, index) => {
                const percentage =
                  statistik.totalNaskah > 0
                    ? Math.round((item.value / statistik.totalNaskah) * 100)
                    : 0;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {loading ? "..." : item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Total Naskah</span>
                <span className="font-bold text-slate-900">
                  {loading ? "..." : statistik.totalNaskah}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold">
                Butuh Bantuan?
              </h3>
              <p className="text-teal-50 text-sm mt-1">
                Lihat dokumentasi atau hubungi tim support untuk bantuan lebih
                lanjut.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                Dokumentasi
              </button>
              <button className="px-4 py-2 bg-white text-teal-600 hover:bg-teal-50 rounded-lg text-sm font-medium transition-colors">
                Hubungi Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
