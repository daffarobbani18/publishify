"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

export default function DashboardPage() {
  const router = useRouter();
  const { pengguna } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statistik, setStatistik] = useState<StatistikNaskah | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Simulasi loading kecil untuk chart & komentar
  useEffect(() => {
    const t1 = setTimeout(() => setLoadingChart(false), 800);
    const t2 = setTimeout(() => setLoadingComments(false), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

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
        console.log("Redirecting editor to /dashboard/editor");
        setIsRedirecting(true);
        router.replace("/dashboard/editor");
        return;
      }
    }
  }, [pengguna, router]);

  // Fetch statistik dari API
  useEffect(() => {
    // Jangan fetch jika sedang redirect
    if (isRedirecting) return;

    const fetchStatistik = async () => {
      setLoadingStats(true);
      try {
        const res = await naskahApi.ambilStatistik();
        setStatistik(res.data);
      } catch (e: any) {
        console.error("Gagal memuat statistik:", e);
        toast.error("Gagal memuat statistik");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistik();
  }, [isRedirecting]);

  // Data statistik berdasarkan API response
  const stats = statistik
    ? [
        {
          label: "Draft",
          value: statistik.perStatus.draft || 0,
          color: "bg-blue-500",
        },
        {
          label: "Review",
          value: statistik.perStatus.dalam_review || 0,
          color: "bg-yellow-500",
        },
        {
          label: "Disetujui",
          value: statistik.perStatus.disetujui || 0,
          color: "bg-purple-500",
        },
        {
          label: "Diterbitkan",
          value: statistik.perStatus.diterbitkan || 0,
          color: "bg-green-500",
        },
      ]
    : [
        { label: "Draft", value: 0, color: "bg-blue-500" },
        { label: "Review", value: 0, color: "bg-yellow-500" },
        { label: "Disetujui", value: 0, color: "bg-purple-500" },
        { label: "Diterbitkan", value: 0, color: "bg-green-500" },
      ];

  // Data penjualan untuk chart (placeholder - bisa diganti dengan API nanti)
  const salesData = [
    { month: "Jan", value: 290 },
    { month: "Feb", value: 402 },
    { month: "Mar", value: 514 },
    { month: "Apr", value: 625 },
    { month: "Mei", value: 738 },
    { month: "Jun", value: 848 },
  ];

  // Komentar terbaru (placeholder - bisa diganti dengan API nanti)
  const comments: Array<{ nama: string; waktu: string; pesan: string }> = [];

  // Rating (placeholder - bisa diganti dengan API nanti)
  const rating = 0;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4 ml-8">
              <button className="relative p-2 text-gray-600 hover:text-[#14b8a6] transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="w-10 h-10 bg-[#14b8a6] rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-[#0d9488] transition-colors">
                P
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8 space-y-8">
        {/* Stats Cards - Kamu telah menulis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">
            Kamu telah menulis
          </h2>
          {loadingStats ? (
            <div className="grid grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="h-10 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sales Chart */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sales Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Penjualan
                </h3>
                <p className="text-sm text-gray-500">
                  Statistik penjualan buku dalam 6 bulan terakhir
                </p>
              </div>

              {/* Simple Bar Chart */}
              <div className="relative h-64 bg-gray-50 rounded-xl p-6">
                <div className="absolute top-4 left-4 right-4">
                  <div className="text-xs font-semibold text-gray-500 mb-2">
                    BUKU 1
                  </div>
                </div>

                {/* Chart Area */}
                {loadingChart ? (
                  <div className="h-full flex items-end justify-between px-4 pt-12 pb-8 animate-pulse">
                    {[40, 70, 55, 85, 60, 95].map((h, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-2 flex-1"
                      >
                        <div
                          className="w-full flex items-end justify-center"
                          style={{ height: "150px" }}
                        >
                          <div
                            className="w-12 bg-gray-200 rounded-t-lg"
                            style={{ height: `${h}%`, minHeight: "6px" }}
                          ></div>
                        </div>
                        <span className="h-3 w-10 bg-gray-200 rounded"></span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-end justify-between px-4 pt-12 pb-8">
                    {salesData.map((data, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center gap-2 flex-1"
                      >
                        {/* Bar */}
                        <div
                          className="w-full flex items-end justify-center"
                          style={{ height: "150px" }}
                        >
                          <div
                            className="w-12 bg-gradient-to-t from-[#14b8a6] to-[#0d9488] rounded-t-lg transition-all hover:opacity-80"
                            style={{
                              height:
                                data.value === 0
                                  ? "4px"
                                  : `${(data.value / Math.max(...salesData.map((d) => d.value), 1)) * 100}%`,
                              minHeight: "4px",
                            }}
                          ></div>
                        </div>
                        {/* Month Label */}
                        <span className="text-xs text-gray-600 font-medium">
                          {data.month.substring(0, 3)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Comments & Rating */}
          <div className="space-y-8">
            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Komentar
              </h3>

              {loadingComments ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/5" />
                        <div className="h-3 bg-gray-200 rounded w-4/5" />
                        <div className="h-3 bg-gray-200 rounded w-3/5" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">Belum ada komentar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#14b8a6] text-white flex items-center justify-center font-semibold">
                        {c.nama.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">
                            {c.nama}
                          </div>
                          <div className="text-xs text-gray-500">{c.waktu}</div>
                        </div>
                        <p className="text-gray-700 mt-1">{c.pesan}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Rating
              </h3>

              <div className="flex items-center justify-center gap-2 py-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-12 h-12 ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    } transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {rating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">dari 5.0</div>
                <div className="text-xs text-gray-400 mt-2">
                  Belum ada rating
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
