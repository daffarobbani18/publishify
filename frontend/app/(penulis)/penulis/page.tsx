"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Send,
  Clock,
  TrendingUp,
  MessageSquare,
  Star,
  ArrowRight,
  Calendar,
  User,
  FilePlus,
  FileCheck,
  Lock,
  Users,
} from "lucide-react";
import { naskahApi } from "@/lib/api/naskah";
import { useAuthStore } from "@/stores/use-auth-store";

interface StatistikNaskah {
  totalNaskah: number;
  perStatus: {
    draft?: number;
    diajukan?: number;
    dalam_review?: number;
    perlu_revisi?: number;
    disetujui?: number;
    ditolak?: number;
    diterbitkan?: number;
  };
  perKategori: Array<{ kategori: string; total: number }>;
  naskahTerbaru: Array<{
    id: string;
    judul: string;
    status: string;
    dibuatPada: string;
    urlSampul?: string;
  }>;
}

// Fungsi untuk mendapatkan sapaan berdasarkan waktu
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export default function DashboardPage() {
  const router = useRouter();
  const { pengguna } = useAuthStore();
  const [loadingStats, setLoadingStats] = useState(true);
  const [statistik, setStatistik] = useState<StatistikNaskah | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect berdasarkan role
  useEffect(() => {
    if (pengguna) {
      // Support kedua format: peran (array string) dan peranPengguna (array object)
      let isPenulis = false;
      let isEditor = false;
      let isAdmin = false;

      // Cek dari peran (format array string dari backend login)
      if (pengguna.peran) {
        isPenulis = pengguna.peran.includes("penulis");
        isEditor = pengguna.peran.includes("editor");
        isAdmin = pengguna.peran.includes("admin");
      }

      // Cek dari peranPengguna (format lengkap)
      if (pengguna.peranPengguna) {
        isPenulis =
          isPenulis ||
          pengguna.peranPengguna.some(
            (peran) => peran.jenisPeran === "penulis" && peran.aktif,
          );
        isEditor =
          isEditor ||
          pengguna.peranPengguna.some(
            (peran) => peran.jenisPeran === "editor" && peran.aktif,
          );
        isAdmin =
          isAdmin ||
          pengguna.peranPengguna.some(
            (peran) => peran.jenisPeran === "admin" && peran.aktif,
          );
      }

      // Priority redirect: Admin > Editor > Penulis
      if (isAdmin) {
        console.log("Redirecting admin to /admin");
        setIsRedirecting(true);
        router.replace("/admin");
        return;
      }

      // Jika hanya editor (bukan penulis), redirect ke dashboard editor
      if (isEditor && !isPenulis) {
        console.log("Redirecting editor to /penulis/editor");
        setIsRedirecting(true);
        router.replace("/penulis/editor");
        return;
      }
    }
  }, [pengguna, router]);

  // Fetch statistik dari API
  useEffect(() => {
    // Jangan fetch jika sedang redirect atau belum ada pengguna (token belum ready)
    if (isRedirecting || !pengguna) return;

    const fetchStatistik = async () => {
      setLoadingStats(true);
      try {
        const res = await naskahApi.ambilStatistik();
        setStatistik(res.data);
      } catch (e: any) {
        console.error("Gagal memuat statistik:", e);
        // Jangan tampilkan toast untuk error 401 karena mungkin token belum ready
        if (e?.response?.status !== 401) {
          toast.error("Gagal memuat statistik");
        }
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistik();
  }, [isRedirecting, pengguna]);

  // Get current year
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  // Data statistik berdasarkan API response - 8 cards layout
  const stats = statistik
    ? [
        {
          label: "Total Naskah",
          sublabel: "Total di semua",
          value: statistik.totalNaskah || 0,
          icon: BookOpen,
          bgColor: "bg-blue-500",
        },
        {
          label: "Naskah Draft",
          sublabel: "Sedang ditulis",
          value: statistik.perStatus.draft || 0,
          icon: FileText,
          bgColor: "bg-teal-500",
        },
        {
          label: "Naskah Diajukan",
          sublabel: "Menunggu review",
          value: statistik.perStatus.diajukan || 0,
          icon: Send,
          bgColor: "bg-purple-500",
        },
        {
          label: "Buku Terbit",
          sublabel: "Sudah diterbitkan",
          value: statistik.perStatus.diterbitkan || 0,
          icon: CheckCircle2,
          bgColor: "bg-teal-500",
        },
        {
          label: "Dalam Review",
          sublabel: "Sedang ditinjau",
          value: statistik.perStatus.dalam_review || 0,
          icon: Clock,
          bgColor: "bg-blue-500",
        },
        {
          label: "Perlu Revisi",
          sublabel: "Butuh perbaikan",
          value: statistik.perStatus.perlu_revisi || 0,
          icon: FilePlus,
          bgColor: "bg-pink-500",
        },
        {
          label: "Disetujui",
          sublabel: "Siap terbit",
          value: statistik.perStatus.disetujui || 0,
          icon: FileCheck,
          bgColor: "bg-green-500",
        },
        {
          label: "Ditolak",
          sublabel: "Tidak lolos",
          value: statistik.perStatus.ditolak || 0,
          icon: Lock,
          bgColor: "bg-orange-500",
        },
      ]
    : [
        {
          label: "Total Naskah",
          sublabel: "Total di semua",
          value: 0,
          icon: BookOpen,
          bgColor: "bg-blue-500",
        },
        {
          label: "Naskah Draft",
          sublabel: "Sedang ditulis",
          value: 0,
          icon: FileText,
          bgColor: "bg-teal-500",
        },
        {
          label: "Naskah Diajukan",
          sublabel: "Menunggu review",
          value: 0,
          icon: Send,
          bgColor: "bg-purple-500",
        },
        {
          label: "Buku Terbit",
          sublabel: "Sudah diterbitkan",
          value: 0,
          icon: CheckCircle2,
          bgColor: "bg-teal-500",
        },
        {
          label: "Dalam Review",
          sublabel: "Sedang ditinjau",
          value: 0,
          icon: Clock,
          bgColor: "bg-blue-500",
        },
        {
          label: "Perlu Revisi",
          sublabel: "Butuh perbaikan",
          value: 0,
          icon: FilePlus,
          bgColor: "bg-pink-500",
        },
        {
          label: "Disetujui",
          sublabel: "Siap terbit",
          value: 0,
          icon: FileCheck,
          bgColor: "bg-green-500",
        },
        {
          label: "Ditolak",
          sublabel: "Tidak lolos",
          value: 0,
          icon: Lock,
          bgColor: "bg-orange-500",
        },
      ];

  // Loading state saat redirect - HARUS SETELAH SEMUA HOOKS
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#14b8a6] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Mengarahkan ke Dashboard Editor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
                Dashboard Penulis
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Kelola naskah dan pantau progres penerbitan Anda
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:block ml-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards - 8 Cards (4x2 grid) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 border border-slate-200"
                >
                  <div className="h-8 w-8 bg-slate-200 rounded-lg mb-2" />
                  <div className="h-6 bg-slate-200 rounded mb-1" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-1">
                          {stat.label}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {stat.sublabel}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Verifikasi & Naskah Status */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Naskah Verification Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
            >
              {/* Verifikasi Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {statistik?.perStatus.perlu_revisi || 0}
                    </div>
                    <div className="text-sm opacity-90">
                      Naskah perlu verifikasi ulang
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FilePlus className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Novel Terbit Card */}
              <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-lg p-4 sm:p-6 text-white shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {statistik?.perStatus.diterbitkan || 0}
                    </div>
                    <div className="text-sm opacity-90">Novel diterbitkan</div>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Statistik Kelas Chart - Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6"
            >
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  Statistik Naskah per Kategori
                </h3>
              </div>

              {/* Simple Bar Chart Placeholder */}
              <div className="h-48 sm:h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4">
                {statistik?.perKategori?.slice(0, 6).map((item, idx) => {
                  const maxValue = Math.max(
                    ...(statistik.perKategori?.map((i) => i.total) || [1]),
                  );
                  const height = (item.total / maxValue) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full flex items-end justify-center"
                        style={{ height: "180px" }}
                      >
                        <div
                          className="w-full max-w-[40px] bg-gradient-to-t from-blue-500 to-teal-500 rounded-t-lg transition-all hover:opacity-80"
                          style={{
                            height: `${height}%`,
                            minHeight: "8px",
                          }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-600 font-medium text-center line-clamp-2">
                        {item.kategori}
                      </span>
                    </div>
                  );
                })}
                {(!statistik?.perKategori ||
                  statistik.perKategori.length === 0) && (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <p className="text-sm">Belum ada data kategori</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Aktivitas */}
          <div className="space-y-4 sm:space-y-6">
            {/* Aktivitas Terbaru */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6"
            >
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-4">
                Aktivitas Terbaru
              </h3>

              {statistik?.naskahTerbaru &&
              statistik.naskahTerbaru.length > 0 ? (
                <div className="space-y-3">
                  {statistik.naskahTerbaru.slice(0, 5).map((naskah, idx) => (
                    <div
                      key={naskah.id}
                      className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-900 line-clamp-2 break-words">
                          {naskah.judul}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {naskah.status.replace(/_/g, " ")} •{" "}
                          {new Date(naskah.dibuatPada).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short" },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Belum ada aktivitas
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Aksi Cepat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-3 sm:mb-4">
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/penulis/naskah/buat")}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FilePlus className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Tambah Naskah Baru
                  </h4>
                  <p className="text-xs text-slate-600">Mulai tulis naskah</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/penulis/draf")}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Kelola Naskah
                  </h4>
                  <p className="text-xs text-slate-600">Lihat semua naskah</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/penulis/buku-terbit")}
              className="bg-white rounded-lg p-4 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    Lihat Buku Terbit
                  </h4>
                  <p className="text-xs text-slate-600">Naskah diterbitkan</p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
