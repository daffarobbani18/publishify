"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { naskahApi } from "@/lib/api/naskah";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ============================================
// TYPES & INTERFACES
// ============================================

interface ProfilPengguna {
  namaDepan?: string;
  namaBelakang?: string;
  namaTampilan?: string;
  urlAvatar?: string;
}

interface ProfilPenulis {
  namaPena?: string;
}

interface Penulis {
  id: string;
  email: string;
  profilPengguna?: ProfilPengguna;
  profilPenulis?: ProfilPenulis;
}

interface Kategori {
  id: string;
  nama: string;
  slug: string;
}

interface Genre {
  id: string;
  nama: string;
  slug: string;
}

interface Naskah {
  id: string;
  idPenulis: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  status: string;
  urlSampul?: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  dibuatPada: string;
  diperbaruiPada: string;
  penulis: Penulis;
  kategori: Kategori;
  genre: Genre;
}

interface StatistikAntrian {
  totalDiajukan: number;
  totalDalamReview: number;
  totalMenungguEditor: number;
  rataRataMenunggu: number; // dalam hari
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const dapatkanNamaPenulis = (penulis: Penulis): string => {
  if (penulis.profilPenulis?.namaPena) {
    return penulis.profilPenulis.namaPena;
  }
  if (penulis.profilPengguna?.namaTampilan) {
    return penulis.profilPengguna.namaTampilan;
  }
  if (penulis.profilPengguna?.namaDepan && penulis.profilPengguna?.namaBelakang) {
    return `${penulis.profilPengguna.namaDepan} ${penulis.profilPengguna.namaBelakang}`;
  }
  if (penulis.profilPengguna?.namaDepan) {
    return penulis.profilPengguna.namaDepan;
  }
  return penulis.email.split("@")[0];
};

const getStatusBadgeStyle = (status: string) => {
  const styles: Record<string, string> = {
    diajukan: "bg-orange-100 text-orange-700 border-orange-300",
    dalam_review: "bg-blue-100 text-blue-700 border-blue-300",
  };
  return styles[status] || "bg-gray-100 text-gray-700 border-gray-300";
};

const getLabelStatus = (status: string): string => {
  const labels: Record<string, string> = {
    diajukan: "Menunggu Review",
    dalam_review: "Dalam Review",
  };
  return labels[status] || status;
};

const hitungHariMenunggu = (tanggal: string): number => {
  const sekarang = new Date();
  const tanggalDiajukan = new Date(tanggal);
  const diffTime = Math.abs(sekarang.getTime() - tanggalDiajukan.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// ============================================
// SKELETON COMPONENT
// ============================================

const SkeletonAntrianReview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8f5f4] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function AntrianReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [naskahList, setNaskahList] = useState<Naskah[]>([]);
  const [filteredNaskah, setFilteredNaskah] = useState<Naskah[]>([]);
  const [statistik, setStatistik] = useState<StatistikAntrian>({
    totalDiajukan: 0,
    totalDalamReview: 0,
    totalMenungguEditor: 0,
    rataRataMenunggu: 0,
  });
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [pencarian, setPencarian] = useState("");

  useEffect(() => {
    ambilDataAntrian();
  }, []);

  useEffect(() => {
    filterData();
  }, [filterStatus, pencarian, naskahList]);

  const ambilDataAntrian = async () => {
    try {
      setLoading(true);
      
      // Ambil naskah dengan status diajukan dan dalam_review
      const [responseDiajukan, responseDalamReview] = await Promise.all([
        naskahApi.ambilSemuaNaskahAdmin({ status: "diajukan" }),
        naskahApi.ambilSemuaNaskahAdmin({ status: "dalam_review" }),
      ]);

      const naskahDiajukan = responseDiajukan.sukses ? responseDiajukan.data : [];
      const naskahDalamReview = responseDalamReview.sukses ? responseDalamReview.data : [];
      
      const semuaNaskah = [...naskahDiajukan, ...naskahDalamReview] as unknown as Naskah[];
      setNaskahList(semuaNaskah);

      // Hitung statistik
      const totalMenunggu = semuaNaskah.filter((n) => n.status === "diajukan").length;
      const hariMenunggu = semuaNaskah
        .filter((n) => n.status === "diajukan")
        .map((n) => hitungHariMenunggu(n.diperbaruiPada));
      const rataRata = hariMenunggu.length > 0 
        ? Math.round(hariMenunggu.reduce((a, b) => a + b, 0) / hariMenunggu.length)
        : 0;

      setStatistik({
        totalDiajukan: naskahDiajukan.length,
        totalDalamReview: naskahDalamReview.length,
        totalMenungguEditor: totalMenunggu,
        rataRataMenunggu: rataRata,
      });

    } catch (error: any) {
      console.error("Error fetching antrian:", error);
      toast.error("Gagal memuat data antrian review");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...naskahList];

    // Filter by status
    if (filterStatus !== "semua") {
      filtered = filtered.filter((n) => n.status === filterStatus);
    }

    // Filter by search
    if (pencarian) {
      const search = pencarian.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.judul.toLowerCase().includes(search) ||
          dapatkanNamaPenulis(n.penulis).toLowerCase().includes(search) ||
          n.kategori.nama.toLowerCase().includes(search)
      );
    }

    setFilteredNaskah(filtered);
  };

  const handleLihatDetail = (id: string) => {
    router.push(`/dashboard/admin/naskah/${id}`);
  };

  const handleTugaskanReview = (id: string) => {
    router.push(`/dashboard/admin/review/tugaskan?naskahId=${id}`);
  };

  if (loading) {
    return <SkeletonAntrianReview />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8f5f4] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⏰ Antrian Review
              </h1>
              <p className="text-gray-600">
                Naskah yang menunggu untuk direview oleh editor
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Diajukan */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Menunggu Review</p>
                <p className="text-3xl font-bold text-orange-600">
                  {statistik.totalDiajukan}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-orange-600"
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
              </div>
            </div>
          </div>

          {/* Dalam Review */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Dalam Review</p>
                <p className="text-3xl font-bold text-blue-600">
                  {statistik.totalDalamReview}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-blue-600"
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

          {/* Total Antrian */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Antrian</p>
                <p className="text-3xl font-bold text-[#14b8a6]">
                  {statistik.totalDiajukan + statistik.totalDalamReview}
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Rata-rata Menunggu */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rata-rata Tunggu</p>
                <p className="text-3xl font-bold text-purple-600">
                  {statistik.rataRataMenunggu} hari
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
              >
                <option value="semua">Semua Status</option>
                <option value="diajukan">Menunggu Review</option>
                <option value="dalam_review">Dalam Review</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cari Naskah
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pencarian}
                  onChange={(e) => setPencarian(e.target.value)}
                  placeholder="Cari judul, penulis, atau kategori..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
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
          </div>
        </div>

        {/* Naskah List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              📚 Daftar Naskah ({filteredNaskah.length})
            </h2>
          </div>

          {filteredNaskah.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-gray-300"
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
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Tidak ada naskah dalam antrian
              </p>
              <p className="text-gray-500">
                Semua naskah sudah direview atau belum ada yang diajukan
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Naskah
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Penulis
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Menunggu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Diajukan
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNaskah.map((naskah) => (
                    <tr
                      key={naskah.id}
                      className="hover:bg-[#f5f7fa] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#14b8a6] to-[#0d7377] rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-white"
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
                          </div>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => handleLihatDetail(naskah.id)}
                              className="text-sm font-semibold text-gray-900 hover:text-[#14b8a6] transition-colors line-clamp-2 text-left"
                            >
                              {naskah.judul}
                            </button>
                            {naskah.jumlahKata && (
                              <p className="text-xs text-gray-500 mt-1">
                                {naskah.jumlahKata.toLocaleString("id-ID")} kata
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {dapatkanNamaPenulis(naskah.penulis)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {naskah.penulis.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e8f5f4] text-[#0d7377]">
                          {naskah.kategori.nama}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(
                            naskah.status
                          )}`}
                        >
                          {getLabelStatus(naskah.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {hitungHariMenunggu(naskah.diperbaruiPada)} hari
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {format(new Date(naskah.diperbaruiPada), "dd MMM yyyy", {
                            locale: idLocale,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleLihatDetail(naskah.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#14b8a6] hover:text-white hover:bg-[#14b8a6] border border-[#14b8a6] rounded-lg transition-all"
                          >
                            Detail
                          </button>
                          {naskah.status === "diajukan" && (
                            <button
                              onClick={() => handleTugaskanReview(naskah.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:shadow-lg transition-all"
                            >
                              Tugaskan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
