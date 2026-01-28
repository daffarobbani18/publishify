"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { naskahApi } from "@/lib/api/naskah";

import {
  STATUS_NASKAH,
  type StatusNaskah,
} from "@/lib/constants/status-naskah";

// Gunakan type any untuk menghindari konflik tipe
type NaskahWithRelations = any;

export default function AdminNaskahPage() {
  const router = useRouter();
  const [daftarNaskah, setDaftarNaskah] = useState<NaskahWithRelations[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [filter, setFilter] = useState<string>("semua");
  const [pencarian, setPencarian] = useState("");

  useEffect(() => {
    fetchDaftarNaskah();
  }, [filter]);

  const fetchDaftarNaskah = async () => {
    try {
      setSedangMemuat(true);

      // Ambil semua naskah
      const response = await naskahApi.ambilSemuaNaskah();

      let naskah = response.data || [];

      // Filter berdasarkan status
      if (filter !== "semua") {
        naskah = naskah.filter((n) => n.status === filter);
      }

      setDaftarNaskah(naskah);
    } catch (error: any) {
      console.error("Error fetching naskah:", error);
      toast.error(error.response?.data?.pesan || "Gagal memuat daftar naskah");
      setDaftarNaskah([]);
    } finally {
      setSedangMemuat(false);
    }
  };

  const handleLihatDetail = (id: string) => {
    router.push(`/admin/naskah/${id}`);
  };

  const getLabelStatus = (status: string) => {
    const s = status as StatusNaskah;
    return STATUS_NASKAH[s]?.label || status;
  };

  const getWarnaBadgeStatus = (status: string) => {
    const s = status as StatusNaskah;
    const config = STATUS_NASKAH[s];
    return config
      ? `${config.warnaBg} ${config.warnaTeks}`
      : "bg-gray-100 text-gray-800";
  };

  const getLabelRekomendasi = (rekomendasi?: string) => {
    if (!rekomendasi) return null;
    const labels: Record<string, string> = {
      setujui: "Disetujui",
      revisi: "Perlu Revisi",
      tolak: "Ditolak",
    };
    return labels[rekomendasi] || rekomendasi;
  };

  const getWarnaBadgeRekomendasi = (rekomendasi?: string) => {
    if (!rekomendasi) return "";
    const colors: Record<string, string> = {
      setujui: "bg-green-100 text-green-800 border border-green-200",
      revisi: "bg-amber-100 text-amber-800 border border-amber-200",
      tolak: "bg-red-100 text-red-800 border border-red-200",
    };
    return colors[rekomendasi] || "bg-gray-100 text-gray-800";
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter berdasarkan pencarian
  const naskahTerfilter = daftarNaskah.filter((naskah) => {
    if (!pencarian) return true;
    const query = pencarian.toLowerCase();
    const namaPenulis =
      `${naskah.penulis?.profilPengguna?.namaDepan || ""} ${naskah.penulis?.profilPengguna?.namaBelakang || ""}`.trim();
    return (
      naskah.judul?.toLowerCase().includes(query) ||
      naskah.sinopsis?.toLowerCase().includes(query) ||
      namaPenulis.toLowerCase().includes(query)
    );
  });

  // Hitung statistik
  const statistik = {
    total: daftarNaskah.length,
    draft: daftarNaskah.filter((n) => n.status === "draft").length,
    diajukan: daftarNaskah.filter((n) => n.status === "diajukan").length,
    dalamReview: daftarNaskah.filter((n) => n.status === "dalam_review").length,
    dalamEditing: daftarNaskah.filter((n) => n.status === "dalam_editing")
      .length,
    siapTerbit: daftarNaskah.filter((n) => n.status === "siap_terbit").length,
    disetujui: daftarNaskah.filter((n) => n.status === "disetujui").length, // Legacy? status 'disetujui' might be replaced by flow
    ditolak: daftarNaskah.filter((n) => n.status === "ditolak").length,
    diterbitkan: daftarNaskah.filter((n) => n.status === "diterbitkan").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📚 Manajemen Naskah
          </h1>
          <p className="text-gray-600">
            Kelola dan pantau semua naskah dalam sistem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistik.total}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Draft</p>
              <p className="text-2xl font-bold text-gray-600">
                {statistik.draft}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Diajukan</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statistik.diajukan}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Review</p>
              <p className="text-2xl font-bold text-blue-600">
                {statistik.dalamReview}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Editing</p>
              <p className="text-2xl font-bold text-indigo-600">
                {statistik.dalamEditing}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Siap</p>
              <p className="text-2xl font-bold text-teal-600">
                {statistik.siapTerbit}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Ditolak</p>
              <p className="text-2xl font-bold text-red-600">
                {statistik.ditolak}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Terbit</p>
              <p className="text-2xl font-bold text-purple-600">
                {statistik.diterbitkan}
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setFilter("semua")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "semua"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua ({statistik.total})
            </button>
            <button
              onClick={() => setFilter("diajukan")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "diajukan"
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Diajukan ({statistik.diajukan})
            </button>
            <button
              onClick={() => setFilter("dalam_review")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "dalam_review"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Review ({statistik.dalamReview})
            </button>
            <button
              onClick={() => setFilter("dalam_editing")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "dalam_editing"
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Editing ({statistik.dalamEditing})
            </button>
            <button
              onClick={() => setFilter("siap_terbit")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "siap_terbit"
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Siap ({statistik.siapTerbit})
            </button>
            <button
              onClick={() => setFilter("ditolak")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "ditolak"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Ditolak ({statistik.ditolak})
            </button>
            <button
              onClick={() => setFilter("diterbitkan")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "diterbitkan"
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Terbit ({statistik.diterbitkan})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Cari berdasarkan judul, sinopsis, atau penulis..."
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabel Naskah */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Judul Naskah
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Penulis
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Rekomendasi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Tanggal Dibuat
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {sedangMemuat ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : naskahTerfilter.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <span className="text-6xl">📭</span>
                        <p className="text-gray-600 text-lg">
                          Tidak ada naskah yang ditemukan
                        </p>
                        <p className="text-gray-500 text-sm">
                          {pencarian
                            ? `Tidak ada hasil untuk "${pencarian}"`
                            : filter === "semua"
                              ? "Belum ada naskah yang dibuat"
                              : `Tidak ada naskah dengan status "${getLabelStatus(filter)}"`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  naskahTerfilter.map((naskah, index) => (
                    <tr
                      key={naskah.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {naskah.judul}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {naskah.sinopsis}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {naskah.penulis?.profilPengguna?.namaDepan || ""}{" "}
                        {naskah.penulis?.profilPengguna?.namaBelakang || ""}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {naskah.kategori?.nama || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getWarnaBadgeStatus(
                            naskah.status,
                          )}`}
                        >
                          {getLabelStatus(naskah.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {naskah.review &&
                        naskah.review.length > 0 &&
                        naskah.review[0].rekomendasi ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getWarnaBadgeRekomendasi(
                              naskah.review[0].rekomendasi,
                            )}`}
                          >
                            {getLabelRekomendasi(naskah.review[0].rekomendasi)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Belum ada
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatTanggal(naskah.dibuatPada)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleLihatDetail(naskah.id)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Footer */}
        {!sedangMemuat && naskahTerfilter.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Menampilkan {naskahTerfilter.length} dari {daftarNaskah.length}{" "}
            naskah
          </div>
        )}
      </div>
    </div>
  );
}
