"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  bio?: string;
}

interface ProfilPenulis {
  namaPena?: string;
  biografi?: string;
  spesialisasi?: string[];
  ratingRataRata?: number;
  totalBuku?: number;
}

interface Penulis {
  id: string;
  email: string;
  profilPengguna?: ProfilPengguna;
  profilPenulis?: ProfilPenulis;
}

interface Editor {
  id: string;
  email: string;
  profilPengguna?: {
    namaDepan?: string;
    namaBelakang?: string;
  };
}

interface Kategori {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string;
}

interface Genre {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string;
}

interface RevisiNaskah {
  id: string;
  versi: number;
  catatan?: string;
  urlFile: string;
  dibuatPada: string;
}

interface ReviewNaskah {
  id: string;
  status: string;
  rekomendasi?: "setujui" | "revisi" | "tolak";
  catatan?: string;
  ditugaskanPada: string;
  dimulaiPada?: string;
  selesaiPada?: string;
  editor: Editor;
  feedback?: Array<{
    id: string;
    komentar: string;
    bab?: string;
    halaman?: number;
    dibuatPada: string;
  }>;
}

interface NaskahDetail {
  id: string;
  idPenulis: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  isbn?: string;
  idKategori: string;
  idGenre: string;
  bahasaTulis: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  status: string;
  urlSampul?: string;
  urlFile?: string;
  publik: boolean;
  diterbitkanPada?: string;
  dibuatPada: string;
  diperbaruiPada: string;
  penulis: Penulis;
  kategori: Kategori;
  genre: Genre;
  revisi?: RevisiNaskah[];
  review?: ReviewNaskah[];
  _count?: {
    revisi: number;
    review: number;
  };
}

interface LogAktivitas {
  jenis: string;
  aksi: string;
  deskripsi?: string;
  waktu: string;
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

const dapatkanNamaEditor = (editor: Editor): string => {
  if (editor.profilPengguna?.namaDepan && editor.profilPengguna?.namaBelakang) {
    return `${editor.profilPengguna.namaDepan} ${editor.profilPengguna.namaBelakang}`;
  }
  if (editor.profilPengguna?.namaDepan) {
    return editor.profilPengguna.namaDepan;
  }
  return editor.email.split("@")[0];
};

const getStatusBadgeStyle = (status: string) => {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700 border-gray-300",
    diajukan: "bg-orange-100 text-orange-700 border-orange-300",
    dalam_review: "bg-blue-100 text-blue-700 border-blue-300",
    perlu_revisi: "bg-yellow-100 text-yellow-700 border-yellow-300",
    disetujui: "bg-green-100 text-green-700 border-green-300",
    ditolak: "bg-red-100 text-red-700 border-red-300",
    diterbitkan: "bg-teal-100 text-teal-700 border-teal-300",
  };
  return styles[status] || "bg-gray-100 text-gray-700 border-gray-300";
};

const getLabelStatus = (status: string): string => {
  const labels: Record<string, string> = {
    draft: "Draft",
    diajukan: "Diajukan",
    dalam_review: "Dalam Review",
    perlu_revisi: "Perlu Revisi",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
    diterbitkan: "Diterbitkan",
  };
  return labels[status] || status;
};

const getRekomendasiBadgeStyle = (rekomendasi?: string) => {
  const styles: Record<string, string> = {
    setujui: "bg-green-100 text-green-700",
    revisi: "bg-yellow-100 text-yellow-700",
    tolak: "bg-red-100 text-red-700",
  };
  return rekomendasi ? styles[rekomendasi] || "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-700";
};

const getLabelRekomendasi = (rekomendasi?: string): string => {
  const labels: Record<string, string> = {
    setujui: "Disetujui",
    revisi: "Perlu Revisi",
    tolak: "Ditolak",
  };
  return rekomendasi ? labels[rekomendasi] || "-" : "-";
};

// ============================================
// SKELETON COMPONENTS
// ============================================

const SkeletonDetailNaskah = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8f5f4] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button Skeleton */}
        <div className="mb-6">
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-3/4 bg-gray-200 rounded-lg mb-4 animate-pulse" />
          <div className="h-6 w-1/2 bg-gray-200 rounded-lg mb-4 animate-pulse" />
          <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse" />
              <div className="h-6 w-3/4 bg-gray-200 rounded mx-auto animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function DetailNaskahPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [naskah, setNaskah] = useState<NaskahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulated timeline - akan diganti dengan data dari API log_aktivitas
  const [timeline, setTimeline] = useState<LogAktivitas[]>([]);

  useEffect(() => {
    ambilDetailNaskah();
  }, [id]);

  const ambilDetailNaskah = async () => {
    try {
      setLoading(true);
      setError(null);
      // Gunakan endpoint admin yang bypass validasi akses
      const response = await naskahApi.ambilNaskahByIdAdmin(id);
      
      if (response.sukses) {
        setNaskah(response.data as unknown as NaskahDetail);
        
        // Generate timeline dari data naskah
        generateTimeline(response.data as unknown as NaskahDetail);
      }
    } catch (err: any) {
      console.error("Error fetching naskah:", err);
      setError(err.response?.data?.pesan || "Gagal memuat detail naskah");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeline = (data: NaskahDetail) => {
    const logs: LogAktivitas[] = [];

    // Log: Naskah dibuat
    logs.push({
      jenis: "buat_naskah",
      aksi: "Naskah Dibuat",
      deskripsi: `Naskah "${data.judul}" telah dibuat`,
      waktu: data.dibuatPada,
    });

    // Log: Status changes berdasarkan status saat ini
    if (data.status === "diajukan" || data.status === "dalam_review" || data.status === "perlu_revisi" || data.status === "disetujui" || data.status === "ditolak" || data.status === "diterbitkan") {
      logs.push({
        jenis: "ajukan_naskah",
        aksi: "Naskah Diajukan",
        deskripsi: "Naskah diajukan untuk review",
        waktu: data.diperbaruiPada,
      });
    }

    // Log: Review activities
    if (data.review && data.review.length > 0) {
      data.review.forEach((rev) => {
        logs.push({
          jenis: "review_ditugaskan",
          aksi: "Review Ditugaskan",
          deskripsi: `Review ditugaskan ke ${dapatkanNamaEditor(rev.editor)}`,
          waktu: rev.ditugaskanPada,
        });

        if (rev.dimulaiPada) {
          logs.push({
            jenis: "review_dimulai",
            aksi: "Review Dimulai",
            deskripsi: `${dapatkanNamaEditor(rev.editor)} memulai review`,
            waktu: rev.dimulaiPada,
          });
        }

        if (rev.selesaiPada) {
          logs.push({
            jenis: "review_selesai",
            aksi: "Review Selesai",
            deskripsi: `Review selesai dengan rekomendasi: ${getLabelRekomendasi(rev.rekomendasi)}`,
            waktu: rev.selesaiPada,
          });
        }
      });
    }

    // Log: Revisi
    if (data.revisi && data.revisi.length > 1) {
      data.revisi.slice(1).forEach((rev) => {
        logs.push({
          jenis: "revisi",
          aksi: `Revisi v${rev.versi}`,
          deskripsi: rev.catatan || "Naskah direvisi",
          waktu: rev.dibuatPada,
        });
      });
    }

    // Log: Diterbitkan
    if (data.status === "diterbitkan" && data.diterbitkanPada) {
      logs.push({
        jenis: "terbitkan",
        aksi: "Naskah Diterbitkan",
        deskripsi: "Naskah berhasil diterbitkan",
        waktu: data.diterbitkanPada,
      });
    }

    // Sort by waktu descending (newest first)
    logs.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());

    setTimeline(logs);
  };

  const handleUnduhFile = () => {
    if (naskah?.urlFile) {
      window.open(naskah.urlFile, "_blank");
    }
  };

  const handleKembali = () => {
    router.back();
  };

  if (loading) {
    return <SkeletonDetailNaskah />;
  }

  if (error || !naskah) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8f5f4] p-6 md:p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Naskah Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || "Naskah yang Anda cari tidak tersedia"}</p>
          <button
            onClick={handleKembali}
            className="px-6 py-2 bg-gradient-to-r from-[#14b8a6] to-[#0d7377] text-white rounded-lg hover:shadow-lg transition-all"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8f5f4] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleKembali}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <svg className="w-5 h-5 text-gray-600 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-gray-700 font-medium group-hover:text-teal-600 transition-colors">Kembali</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{naskah.judul}</h1>
          {naskah.subJudul && (
            <p className="text-xl text-gray-600 mb-4">{naskah.subJudul}</p>
          )}
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeStyle(naskah.status)}`}>
              {getLabelStatus(naskah.status)}
            </span>
            {naskah.publik && (
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                Publik
              </span>
            )}
            {naskah.isbn && (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                ISBN: {naskah.isbn}
              </span>
            )}
          </div>
        </div>

        {/* Content Grid: Main (70%) + Sidebar (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 70% */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sinopsis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sinopsis
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{naskah.sinopsis}</p>
            </div>

            {/* File Naskah */}
            {naskah.urlFile && (
              <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl shadow-sm border border-teal-200 p-6 hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  File Naskah
                </h2>
                <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-teal-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{naskah.judul}.pdf</p>
                      <p className="text-sm text-gray-600">
                        {naskah.jumlahHalaman ? `${naskah.jumlahHalaman} halaman` : "Dokumen naskah"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleUnduhFile}
                    className="px-6 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d7377] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Unduh
                  </button>
                </div>
              </div>
            )}

            {/* Timeline Aktivitas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Timeline Aktivitas
              </h2>
              <div className="space-y-4">
                {timeline.length > 0 ? (
                  timeline.map((log, index) => (
                    <div key={index} className="flex gap-4 items-start group">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-4 group-hover:bg-teal-50 transition-colors">
                        <p className="font-semibold text-gray-900">{log.aksi}</p>
                        {log.deskripsi && (
                          <p className="text-sm text-gray-600 mt-1">{log.deskripsi}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {format(new Date(log.waktu), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Belum ada aktivitas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Review History */}
            {naskah.review && naskah.review.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Riwayat Review
                </h2>
                <div className="space-y-4">
                  {naskah.review.map((rev) => (
                    <div key={rev.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {dapatkanNamaEditor(rev.editor).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{dapatkanNamaEditor(rev.editor)}</p>
                            <p className="text-sm text-gray-600">{rev.editor.email}</p>
                          </div>
                        </div>
                        {rev.rekomendasi && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRekomendasiBadgeStyle(rev.rekomendasi)}`}>
                            {getLabelRekomendasi(rev.rekomendasi)}
                          </span>
                        )}
                      </div>
                      {rev.catatan && (
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3">{rev.catatan}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Ditugaskan: {format(new Date(rev.ditugaskanPada), "dd MMM yyyy", { locale: idLocale })}</span>
                        {rev.selesaiPada && (
                          <span>Selesai: {format(new Date(rev.selesaiPada), "dd MMM yyyy", { locale: idLocale })}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 30% */}
          <div className="space-y-6">
            {/* Info Penulis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Informasi Penulis</h3>
              <div className="flex flex-col items-center text-center">
                {naskah.penulis.profilPengguna?.urlAvatar ? (
                  <img
                    src={naskah.penulis.profilPengguna.urlAvatar}
                    alt={dapatkanNamaPenulis(naskah.penulis)}
                    className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-teal-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold mb-4 border-4 border-teal-100">
                    {dapatkanNamaPenulis(naskah.penulis).charAt(0).toUpperCase()}
                  </div>
                )}
                <h4 className="text-xl font-bold text-gray-900 mb-1">{dapatkanNamaPenulis(naskah.penulis)}</h4>
                <p className="text-sm text-gray-600 mb-4">{naskah.penulis.email}</p>
                
                {naskah.penulis.profilPenulis && (
                  <div className="w-full space-y-2 mt-4">
                    {naskah.penulis.profilPenulis.totalBuku !== undefined && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <span className="text-sm text-gray-600">Total Buku</span>
                        <span className="text-sm font-semibold text-gray-900">{naskah.penulis.profilPenulis.totalBuku}</span>
                      </div>
                    )}
                    {naskah.penulis.profilPenulis.ratingRataRata !== undefined && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <span className="text-sm text-gray-600">Rating</span>
                        <span className="text-sm font-semibold text-yellow-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {Number(naskah.penulis.profilPenulis.ratingRataRata).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {naskah.penulis.profilPengguna?.bio && (
                  <div className="w-full mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-left">{naskah.penulis.profilPengguna.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Naskah */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Metadata</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Kategori</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">{naskah.kategori.nama}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Genre</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">{naskah.genre.nama}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Bahasa</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">
                    {naskah.bahasaTulis === "id" ? "Indonesia" : "English"}
                  </span>
                </div>
                {naskah.jumlahKata && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600">Jumlah Kata</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">
                      {naskah.jumlahKata.toLocaleString("id-ID")} kata
                    </span>
                  </div>
                )}
                {naskah.jumlahHalaman && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600">Jumlah Halaman</span>
                    <span className="text-sm font-semibold text-gray-900 text-right">{naskah.jumlahHalaman} halaman</span>
                  </div>
                )}
                <div className="flex items-start justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Dibuat</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">
                    {format(new Date(naskah.dibuatPada), "dd MMM yyyy", { locale: idLocale })}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Terakhir Diubah</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">
                    {format(new Date(naskah.diperbaruiPada), "dd MMM yyyy", { locale: idLocale })}
                  </span>
                </div>
                {naskah.diterbitkanPada && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600">Diterbitkan</span>
                    <span className="text-sm font-semibold text-teal-600 text-right">
                      {format(new Date(naskah.diterbitkanPada), "dd MMM yyyy", { locale: idLocale })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Editor yang Ditugaskan */}
            {naskah.review && naskah.review.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">✍️ Editor yang Ditugaskan</h3>
                <div className="space-y-3">
                  {naskah.review
                    .filter((rev) => rev.status !== "dibatalkan")
                    .map((rev) => (
                      <div key={rev.id} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {dapatkanNamaEditor(rev.editor).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{dapatkanNamaEditor(rev.editor)}</p>
                            <p className="text-xs text-gray-600 truncate">{rev.editor.email}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Status: <span className="font-semibold text-blue-600">{getLabelStatus(rev.status)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Statistik */}
            {naskah._count && (
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Statistik</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <span className="text-sm text-gray-600">Total Revisi</span>
                    <span className="text-lg font-bold text-purple-600">{naskah._count.revisi}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg p-3">
                    <span className="text-sm text-gray-600">Total Review</span>
                    <span className="text-lg font-bold text-purple-600">{naskah._count.review}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
