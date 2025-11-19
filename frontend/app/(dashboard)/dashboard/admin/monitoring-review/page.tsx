"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api/client";

// ================================
// INTERFACES
// ================================

interface ReviewNaskah {
  id: string;
  idNaskah: string;
  idEditor: string;
  status: "ditugaskan" | "dalam_proses" | "selesai" | "dibatalkan";
  rekomendasi?: "setujui" | "revisi" | "tolak";
  catatan?: string;
  ditugaskanPada: string;
  dimulaiPada?: string;
  selesaiPada?: string;
  diperbaruiPada: string;
  naskah: {
    id: string;
    judul: string;
    subJudul?: string;
    status: string;
    penulis: {
      id: string;
      email: string;
      profilPengguna?: {
        namaDepan?: string;
        namaBelakang?: string;
      };
    };
    kategori?: {
      nama: string;
    };
  };
  editor: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
    };
  };
  feedback: Array<{
    id: string;
    bab?: string;
    halaman?: number;
    komentar: string;
    dibuatPada: string;
  }>;
}

interface StatistikReview {
  totalReview: number;
  reviewAktif: number;
  reviewSelesai: number;
  reviewDibatalkan: number;
  perStatus: {
    ditugaskan: number;
    dalam_proses: number;
    selesai: number;
    dibatalkan: number;
  };
  perRekomendasi?: {
    setujui: number;
    revisi: number;
    tolak: number;
  };
}

// ================================
// MAIN COMPONENT
// ================================

export default function MonitoringReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewNaskah[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewNaskah[]>([]);
  const [statistik, setStatistik] = useState<StatistikReview | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterStatus, searchQuery, reviews]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewRes, statsRes] = await Promise.all([
        api.get("/review", { params: { limit: 100 } }),
        api.get("/review/statistik"),
      ]);

      const reviewData = reviewRes.data?.data || [];
      const statsData = statsRes.data?.data;

      setReviews(reviewData);
      setStatistik(statsData);
    } catch (error: any) {
      console.error("Error fetching monitoring data:", error);
      toast.error("Gagal memuat data monitoring review");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    // Filter by status
    if (filterStatus !== "semua") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.naskah?.judul?.toLowerCase().includes(search) ||
          r.editor?.email?.toLowerCase().includes(search) ||
          r.editor?.profilPengguna?.namaDepan?.toLowerCase().includes(search) ||
          r.editor?.profilPengguna?.namaBelakang?.toLowerCase().includes(search) ||
          r.naskah?.penulis?.profilPengguna?.namaDepan?.toLowerCase().includes(search) ||
          r.naskah?.penulis?.profilPengguna?.namaBelakang?.toLowerCase().includes(search)
      );
    }

    setFilteredReviews(filtered);
  };

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const hitungDurasi = (review: ReviewNaskah) => {
    const mulai = review.dimulaiPada || review.ditugaskanPada;
    const selesai = review.selesaiPada || new Date().toISOString();
    const diff = new Date(selesai).getTime() - new Date(mulai).getTime();
    const hari = Math.floor(diff / (1000 * 60 * 60 * 24));
    return hari;
  };

  const getNamaPenulis = (penulis: any) => {
    if (!penulis) return "Unknown";
    if (penulis.profilPengguna) {
      const { namaDepan, namaBelakang } = penulis.profilPengguna;
      return `${namaDepan || ""} ${namaBelakang || ""}`.trim() || penulis.email;
    }
    return penulis.email;
  };

  const getNamaEditor = (editor: any) => {
    if (!editor) return "Unknown";
    if (editor.profilPengguna) {
      const { namaDepan, namaBelakang } = editor.profilPengguna;
      return `${namaDepan || ""} ${namaBelakang || ""}`.trim() || editor.email;
    }
    return editor.email;
  };

  const getLabelStatus = (status: string) => {
    const labels: Record<string, string> = {
      ditugaskan: "Ditugaskan",
      dalam_proses: "Dalam Proses",
      selesai: "Selesai",
      dibatalkan: "Dibatalkan",
    };
    return labels[status] || status;
  };

  const getColorStatus = (status: string) => {
    const colors: Record<string, string> = {
      ditugaskan: "bg-blue-100 text-blue-800 border-blue-300",
      dalam_proses: "bg-amber-100 text-amber-800 border-amber-300",
      selesai: "bg-green-100 text-green-800 border-green-300",
      dibatalkan: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getLabelRekomendasi = (rekomendasi?: string) => {
    if (!rekomendasi) return "-";
    const labels: Record<string, string> = {
      setujui: "Disetujui",
      revisi: "Perlu Revisi",
      tolak: "Ditolak",
    };
    return labels[rekomendasi] || rekomendasi;
  };

  const getColorRekomendasi = (rekomendasi?: string) => {
    if (!rekomendasi) return "bg-gray-100 text-gray-600";
    const colors: Record<string, string> = {
      setujui: "bg-green-100 text-green-800",
      revisi: "bg-amber-100 text-amber-800",
      tolak: "bg-red-100 text-red-800",
    };
    return colors[rekomendasi] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8f5f4] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-[#14b8a6] to-[#0d7377] rounded-xl shadow-lg">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0d7377]">
                📊 Monitoring Review
              </h1>
              <p className="text-gray-600">
                Pantau dan kelola proses review naskah secara real-time
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {statistik && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Review */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Review</p>
                  <p className="text-3xl font-bold text-[#0d7377]">
                    {statistik.totalReview}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#14b8a6]/20 to-[#0d7377]/20 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-[#14b8a6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Review Aktif */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Review Aktif</p>
                  <p className="text-3xl font-bold text-[#14b8a6]">
                    {statistik.reviewAktif}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#14b8a6]/20 to-[#32e0c4]/20 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-[#14b8a6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Review Selesai */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Review Selesai</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {statistik.reviewSelesai}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-emerald-600"
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
                </div>
              </div>
            </div>

            {/* Review Dibatalkan */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dibatalkan</p>
                  <p className="text-3xl font-bold text-red-600">
                    {statistik.reviewDibatalkan}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#0d7377] mb-2">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all"
              >
                <option value="semua">Semua Status</option>
                <option value="ditugaskan">Ditugaskan</option>
                <option value="dalam_proses">Dalam Proses</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-[#0d7377] mb-2">
                Cari Naskah / Editor / Penulis
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik untuk mencari..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-bold text-[#14b8a6]">{filteredReviews.length}</span> dari{" "}
              <span className="font-bold text-[#0d7377]">{reviews.length}</span> review
            </p>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#14b8a6] to-[#0d7377] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Naskah
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Penulis
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Editor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Rekomendasi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Durasi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Ditugaskan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#14b8a6] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500 font-medium">
                          Memuat data review...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <svg
                          className="w-20 h-20 mx-auto mb-4 opacity-50"
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
                        <p className="text-lg font-semibold mb-2">
                          Tidak ada review ditemukan
                        </p>
                        <p className="text-sm">
                          Coba ubah filter atau pencarian Anda
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr
                      key={review.id}
                      className="hover:bg-[#f5f7fa] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <button
                            onClick={() =>
                              router.push(`/dashboard/admin/naskah/${review.naskah?.id}`)
                            }
                            className="font-semibold text-gray-900 truncate hover:text-[#14b8a6] transition-colors text-left"
                          >
                            {review.naskah?.judul || "Tidak tersedia"}
                          </button>
                          {review.naskah?.kategori && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-[#e8f5f4] text-[#0d7377] text-xs rounded-full">
                              {review.naskah.kategori.nama}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {getNamaPenulis(review.naskah?.penulis)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {review.naskah?.penulis?.email || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {getNamaEditor(review.editor)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {review.editor?.email || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getColorStatus(
                            review.status
                          )}`}
                        >
                          {getLabelStatus(review.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getColorRekomendasi(
                            review.rekomendasi
                          )}`}
                        >
                          {getLabelRekomendasi(review.rekomendasi)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                          {review.feedback?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {hitungDurasi(review)} hari
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatTanggal(review.ditugaskanPada)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/admin/review/${review.id}`)
                          }
                          className="text-[#14b8a6] hover:text-[#0d7377] font-semibold text-sm transition-colors flex items-center gap-1"
                        >
                          Lihat Detail
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats by Status */}
        {statistik && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Per Status */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-[#0d7377] mb-4 flex items-center gap-2">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Review per Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-semibold text-gray-700">
                    Ditugaskan
                  </span>
                  <span className="text-lg font-bold text-blue-700">
                    {statistik.perStatus.ditugaskan}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-sm font-semibold text-gray-700">
                    Dalam Proses
                  </span>
                  <span className="text-lg font-bold text-amber-700">
                    {statistik.perStatus.dalam_proses}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm font-semibold text-gray-700">
                    Selesai
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    {statistik.perStatus.selesai}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">
                    Dibatalkan
                  </span>
                  <span className="text-lg font-bold text-gray-700">
                    {statistik.perStatus.dibatalkan}
                  </span>
                </div>
              </div>
            </div>

            {/* Per Rekomendasi */}
            {statistik.perRekomendasi && (
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-[#0d7377] mb-4 flex items-center gap-2">
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
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  Hasil Rekomendasi
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-sm font-semibold text-gray-700">
                      Disetujui
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {statistik.perRekomendasi.setujui}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <span className="text-sm font-semibold text-gray-700">
                      Perlu Revisi
                    </span>
                    <span className="text-lg font-bold text-amber-700">
                      {statistik.perRekomendasi.revisi}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-sm font-semibold text-gray-700">
                      Ditolak
                    </span>
                    <span className="text-lg font-bold text-red-700">
                      {statistik.perRekomendasi.tolak}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
