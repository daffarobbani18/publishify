"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  penggunaApi,
  type Pengguna,
  type JenisPeran,
} from "@/lib/api/pengguna";

type TabKey = "editor" | "penulis";

export default function KelolaPenggunaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("editor");
  const [loading, setLoading] = useState(false);
  const [allPengguna, setAllPengguna] = useState<Pengguna[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("📡 Fetching pengguna data...");

      // Cek token tersedia
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      console.log("🔑 Token tersimpan:", token ? "✅ Ada" : "❌ Tidak ada");

      if (!token) {
        toast.error("Sesi login tidak ditemukan. Silakan login kembali.");
        setAllPengguna([]);
        setLoading(false);
        return;
      }

      const res = await penggunaApi.ambilSemuaPengguna({ limit: 100 });
      console.log("✅ Pengguna data fetched:", res.data?.length, "users");
      setAllPengguna(res.data || []);
    } catch (e: any) {
      console.error("❌ Error fetching pengguna:", {
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        message: e?.message,
        data: e?.response?.data,
      });

      // Handle specific error cases
      if (e?.response?.status === 401) {
        toast.error("Sesi login telah berakhir. Silakan login kembali.");
      } else if (e?.response?.status === 403) {
        toast.error("Anda tidak memiliki akses ke halaman ini.");
      } else {
        const errorMessage =
          e?.response?.data?.pesan ||
          e?.response?.data?.message ||
          e?.message ||
          "Gagal memuat data pengguna. Pastikan Anda sudah login sebagai admin.";

        toast.error(errorMessage);
      }

      // Set empty array jika error untuk menghindari loading state stuck
      setAllPengguna([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter pengguna berdasarkan tab dan search query
  const filteredPengguna = useMemo(() => {
    let filtered = allPengguna.filter((p) => {
      // Filter berdasarkan peran (backend sudah filter yang aktif)
      const hasRole = p.peranPengguna?.some(
        (role) => role.jenisPeran === activeTab,
      );
      return hasRole;
    });

    // Filter berdasarkan search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const namaLengkap =
          `${p.profilPengguna?.namaDepan || ""} ${p.profilPengguna?.namaBelakang || ""}`.toLowerCase();
        const email = p.email.toLowerCase();
        return namaLengkap.includes(query) || email.includes(query);
      });
    }

    return filtered;
  }, [allPengguna, activeTab, searchQuery]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? "nonaktifkan" : "aktifkan";
    const confirm = window.confirm(`Yakin ingin ${action} pengguna ini?`);
    if (!confirm) return;

    try {
      await penggunaApi.updateStatusPengguna(id, !currentStatus);
      toast.success(`Pengguna berhasil di${action}`);
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.pesan || `Gagal ${action} pengguna`);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Yakin ingin menghapus pengguna ini? Aksi ini tidak dapat dibatalkan.",
    );
    if (!confirm) return;

    try {
      await penggunaApi.hapusPengguna(id);
      toast.success("Pengguna berhasil dihapus");
      fetchData();
    } catch (e: any) {
      toast.error(e?.response?.data?.pesan || "Gagal menghapus pengguna");
    }
  };

  const formatTanggal = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const getLabelTab = (tab: TabKey) => {
    const labels = {
      editor: "Editor",
      penulis: "Penulis",
    };
    return labels[tab];
  };

  const getIconTab = (tab: TabKey) => {
    if (tab === "editor") {
      return (
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
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      );
    }
    return (
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
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Gradient Header */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                Kelola Pengguna
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Kelola pengguna sistem berdasarkan peran (Editor, Penulis)
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Editor</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {
                    allPengguna.filter((p) =>
                      p.peranPengguna?.some((r) => r.jenisPeran === "editor"),
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                {getIconTab("editor")}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Penulis</p>
                <p className="text-3xl font-bold text-green-600">
                  {
                    allPengguna.filter((p) =>
                      p.peranPengguna?.some((r) => r.jenisPeran === "penulis"),
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                {getIconTab("penulis")}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-2">
              {(["editor", "penulis"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-[#14b8a6] text-white shadow"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {getIconTab(tab)}
                  {getLabelTab(tab)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none text-gray-700"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
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
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {loading ? "Memuat..." : `${filteredPengguna.length} pengguna`}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email & Telepon
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Terverifikasi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Login Terakhir
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#14b8a6] border-t-transparent rounded-full animate-spin"></div>
                        <span>Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filteredPengguna.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredPengguna.map((pengguna) => (
                    <tr
                      key={pengguna.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Pengguna */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#14b8a6] to-[#0d9488] rounded-full flex items-center justify-center text-white font-semibold">
                            {pengguna.profilPengguna?.namaDepan?.[0]?.toUpperCase() ||
                              pengguna.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {pengguna.profilPengguna?.namaDepan || "N/A"}{" "}
                              {pengguna.profilPengguna?.namaBelakang || ""}
                            </p>
                            <p className="text-sm text-gray-500">
                              {pengguna.profilPengguna?.namaTampilan || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email & Telepon */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {pengguna.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {pengguna.telepon || "-"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {pengguna.aktif ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Terverifikasi */}
                      <td className="px-6 py-4">
                        {pengguna.terverifikasi ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Belum
                          </span>
                        )}
                      </td>

                      {/* Login Terakhir */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {formatTanggal(pengguna.loginTerakhir)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Dibuat: {formatTanggal(pengguna.dibuatPada)}
                        </p>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(pengguna.id, pengguna.aktif)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              pengguna.aktif
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-green-100 text-green-800 hover:bg-green-200"
                            }`}
                          >
                            {pengguna.aktif ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/admin/pengguna/${pengguna.id}`)
                            }
                            className="px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleDelete(pengguna.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
