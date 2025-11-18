"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api/client";

// ================================
// INTERFACES
// ================================

interface StatistikAdmin {
  totalNaskah: number;
  naskahDiajukan: number;
  naskahDalamReview: number;
  naskahDisetujui: number;
  totalEditor: number;
  totalPenulis: number;
  totalPercetakan: number;
  reviewAktif: number;
}

interface ResponseSukses<T> {
  sukses: boolean;
  data: T;
}

// ================================
// MAIN COMPONENT
// ================================

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statistik, setStatistik] = useState<StatistikAdmin>({
    totalNaskah: 0,
    naskahDiajukan: 0,
    naskahDalamReview: 0,
    naskahDisetujui: 0,
    totalEditor: 0,
    totalPenulis: 0,
    totalPercetakan: 0,
    reviewAktif: 0,
  });

  useEffect(() => {
    fetchStatistik();
  }, []);

  const fetchStatistik = async () => {
    setLoading(true);
    try {
      // Debug: Cek token tersimpan
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      console.log("🔑 Token tersimpan:", token ? "✅ Ada" : "❌ Tidak ada");
      
      // Fetch statistik dari berbagai endpoint dengan error handling individual
      const results = await Promise.allSettled([
        // PENTING: Gunakan endpoint admin khusus untuk mengambil SEMUA naskah
        api.get("/naskah/admin/semua", { params: { limit: 100 } }).catch((err) => {
          console.error("❌ Error fetching naskah:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message,
          });
          return { data: { data: [] } };
        }),
        api.get("/pengguna").catch((err) => {
          console.error("❌ Error fetching pengguna:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message,
          });
          return { data: { data: [] } };
        }),
        api.get("/review").catch((err) => {
          console.error("❌ Error fetching review:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message,
          });
          return { data: { data: [] } };
        }),
      ]);

      // Extract data dengan safe handling
      const naskahList = results[0].status === "fulfilled" && results[0].value?.data?.data 
        ? results[0].value.data.data 
        : [];
      
      const penggunaList = results[1].status === "fulfilled" && results[1].value?.data?.data 
        ? results[1].value.data.data 
        : [];
      
      const reviewList = results[2].status === "fulfilled" && results[2].value?.data?.data 
        ? results[2].value.data.data 
        : [];

      console.log("📊 Statistik Admin - Total Naskah:", naskahList.length);
      console.log("📋 Status Naskah:", naskahList.map((n: any) => n.status));

      // Hitung statistik
      setStatistik({
        totalNaskah: naskahList.length,
        naskahDiajukan: naskahList.filter((n: any) => n.status === "diajukan").length,
        naskahDalamReview: naskahList.filter((n: any) => n.status === "dalam_review").length,
        naskahDisetujui: naskahList.filter((n: any) => n.status === "disetujui").length,
        totalEditor: penggunaList.filter((u: any) =>
          u.peranPengguna?.some((p: any) => p.jenisPeran === "editor" && p.aktif)
        ).length,
        totalPenulis: penggunaList.filter((u: any) =>
          u.peranPengguna?.some((p: any) => p.jenisPeran === "penulis" && p.aktif)
        ).length,
        totalPercetakan: penggunaList.filter((u: any) =>
          u.peranPengguna?.some((p: any) => p.jenisPeran === "percetakan" && p.aktif)
        ).length,
        reviewAktif: reviewList.filter(
          (r: any) => r.status === "ditugaskan" || r.status === "dalam_proses"
        ).length,
      });
    } catch (error: any) {
      console.error("Error fetching statistik:", error);
      // Tetap set default values, tidak perlu toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👨‍💼 Dashboard Admin</h1>
          <p className="text-gray-600">Selamat datang di panel administrasi Publishify</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Naskah */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Naskah</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : statistik.totalNaskah}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Naskah Diajukan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Menunggu Review</p>
                <p className="text-3xl font-bold text-orange-600">
                  {loading ? "..." : statistik.naskahDiajukan}
                </p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Review Aktif */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Review Aktif</p>
                <p className="text-3xl font-bold text-purple-600">
                  {loading ? "..." : statistik.reviewAktif}
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Editor</p>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? "..." : statistik.totalEditor}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">⚡ Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/dashboard/admin/antrian-review")}
              className="flex items-center gap-4 p-4 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                  Antrian Review
                </p>
                <p className="text-sm text-gray-600">{statistik.naskahDiajukan} naskah menunggu</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/dashboard/admin/review")}
              className="flex items-center gap-4 p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Semua Naskah
                </p>
                <p className="text-sm text-gray-600">{statistik.totalNaskah} total naskah</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/dashboard/admin/monitoring-review")}
              className="flex items-center gap-4 p-4 border-2 border-teal-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all group"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                  Monitoring Review
                </p>
                <p className="text-sm text-gray-600">{statistik.reviewAktif} review aktif</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/dashboard/admin/pengguna")}
              className="flex items-center gap-4 p-4 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  Kelola Pengguna
                </p>
                <p className="text-sm text-gray-600">
                  {statistik.totalPenulis + statistik.totalEditor + statistik.totalPercetakan} pengguna
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Naskah */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Status Naskah</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Diajukan</span>
                <span className="text-sm font-semibold text-orange-600">
                  {statistik.naskahDiajukan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dalam Review</span>
                <span className="text-sm font-semibold text-purple-600">
                  {statistik.naskahDalamReview}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disetujui</span>
                <span className="text-sm font-semibold text-green-600">
                  {statistik.naskahDisetujui}
                </span>
              </div>
            </div>
          </div>

          {/* User Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Pengguna</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Penulis</span>
                <span className="text-sm font-semibold text-blue-600">
                  {statistik.totalPenulis}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Editor</span>
                <span className="text-sm font-semibold text-green-600">
                  {statistik.totalEditor}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Percetakan</span>
                <span className="text-sm font-semibold text-purple-600">
                  {statistik.totalPercetakan}
                </span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">✅ Kesehatan Sistem</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-semibold text-green-600">Aktif</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-semibold text-green-600">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Update</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date().toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
