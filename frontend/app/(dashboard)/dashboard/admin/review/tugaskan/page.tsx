"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { naskahApi } from "@/lib/api/naskah";
import { penggunaApi, type Pengguna, type JenisPeran } from "@/lib/api/pengguna";
import { reviewApi } from "@/lib/api/review";

// ============================================
// TYPES & INTERFACES
// ============================================

interface ProfilPengguna {
  namaDepan?: string;
  namaBelakang?: string;
  namaTampilan?: string;
  urlAvatar?: string;
}

interface Penulis {
  id: string;
  email: string;
  profilPengguna?: ProfilPengguna;
  profilPenulis?: {
    namaPena?: string;
  };
}

interface Naskah {
  id: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  status: string;
  urlSampul?: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  dibuatPada: string;
  penulis: Penulis;
  kategori: {
    id: string;
    nama: string;
  };
  genre: {
    id: string;
    nama: string;
  };
}

interface Editor {
  id: string;
  email: string;
  profilPengguna?: ProfilPengguna;
  peranPengguna?: Array<{
    jenisPeran: JenisPeran;
  }>;
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
  if (editor.profilPengguna?.namaTampilan) {
    return editor.profilPengguna.namaTampilan;
  }
  if (editor.profilPengguna?.namaDepan && editor.profilPengguna?.namaBelakang) {
    return `${editor.profilPengguna.namaDepan} ${editor.profilPengguna.namaBelakang}`;
  }
  if (editor.profilPengguna?.namaDepan) {
    return editor.profilPengguna.namaDepan;
  }
  return editor.email.split("@")[0];
};

// ============================================
// SKELETON COMPONENT
// ============================================

const SkeletonTugaskanReview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8f5f4] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-6 w-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div className="space-y-6">
          {/* Naskah Card Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          </div>

          {/* Editor Card Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT WRAPPER
// ============================================

function TugaskanReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const naskahId = searchParams.get("naskahId");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [naskah, setNaskah] = useState<Naskah | null>(null);
  const [editorList, setEditorList] = useState<Editor[]>([]);
  const [selectedEditor, setSelectedEditor] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [searchEditor, setSearchEditor] = useState("");

  useEffect(() => {
    if (!naskahId) {
      toast.error("ID Naskah tidak ditemukan");
      router.push("/dashboard/admin/antrian-review");
      return;
    }
    ambilDataAwal();
  }, [naskahId]);

  const ambilDataAwal = async () => {
    if (!naskahId) return;

    try {
      setLoading(true);

      const [responseNaskah, responseEditor] = await Promise.all([
        naskahApi.ambilNaskahByIdAdmin(naskahId),
        penggunaApi.ambilSemuaPengguna({ jenisPeran: "editor", aktif: true }),
      ]);

      if (responseNaskah.sukses) {
        setNaskah(responseNaskah.data as unknown as Naskah);
      }

      if (responseEditor.sukses) {
        setEditorList(responseEditor.data as unknown as Editor[]);
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
      router.push("/dashboard/admin/antrian-review");
    } finally {
      setLoading(false);
    }
  };

  const handleTugaskan = async () => {
    if (!selectedEditor) {
      toast.error("Pilih editor terlebih dahulu");
      return;
    }

    if (!naskahId) {
      toast.error("ID Naskah tidak valid");
      return;
    }

    try {
      setSubmitting(true);

      const response = await reviewApi.tugaskanReview({
        idNaskah: naskahId,
        idEditor: selectedEditor,
        catatan: catatan || undefined,
      });

      if (response.sukses) {
        toast.success("Review berhasil ditugaskan!");
        router.push("/dashboard/admin/monitoring-review");
      }
    } catch (error: any) {
      console.error("Error tugaskan review:", error);
      toast.error(error.response?.data?.pesan || "Gagal menugaskan review");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEditors = editorList.filter((editor) => {
    const search = searchEditor.toLowerCase();
    const nama = dapatkanNamaEditor(editor).toLowerCase();
    const email = editor.email.toLowerCase();
    return nama.includes(search) || email.includes(search);
  });

  if (loading) {
    return <SkeletonTugaskanReview />;
  }

  if (!naskah) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-white to-[#e8f5f4] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-gray-700 font-medium group-hover:text-teal-600 transition-colors">Kembali</span>
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-[#14b8a6] to-[#0d7377] rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                👨‍💼 Tugaskan Review
              </h1>
              <p className="text-gray-600">
                Pilih editor untuk mereview naskah ini
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Info Naskah */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#14b8a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Informasi Naskah
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{naskah.judul}</h3>
                {naskah.subJudul && (
                  <p className="text-lg text-gray-600 mb-2">{naskah.subJudul}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">Penulis</p>
                    <p className="font-semibold text-gray-900">{dapatkanNamaPenulis(naskah.penulis)}</p>
                    <p className="text-xs text-gray-500">{naskah.penulis.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">Kategori & Genre</p>
                    <p className="font-semibold text-gray-900">{naskah.kategori.nama}</p>
                    <p className="text-xs text-gray-500">{naskah.genre.nama}</p>
                  </div>
                </div>
              </div>

              {naskah.jumlahKata && (
                <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#14b8a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {naskah.jumlahKata.toLocaleString("id-ID")} kata
                    </span>
                  </div>
                  {naskah.jumlahHalaman && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#14b8a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {naskah.jumlahHalaman} halaman
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pilih Editor */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#14b8a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pilih Editor
            </h2>

            {/* Search Editor */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchEditor}
                  onChange={(e) => setSearchEditor(e.target.value)}
                  placeholder="Cari editor berdasarkan nama atau email..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Editor List */}
            {filteredEditors.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Tidak ada editor ditemukan
                </p>
                <p className="text-gray-500">
                  Coba ubah kata kunci pencarian Anda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                {filteredEditors.map((editor) => (
                  <button
                    key={editor.id}
                    onClick={() => setSelectedEditor(editor.id)}
                    className={`flex items-start gap-3 p-4 border-2 rounded-xl transition-all text-left ${
                      selectedEditor === editor.id
                        ? "border-[#14b8a6] bg-gradient-to-br from-[#14b8a6]/10 to-[#0d7377]/10 shadow-md"
                        : "border-gray-200 hover:border-[#14b8a6]/50 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                        selectedEditor === editor.id
                          ? "bg-gradient-to-br from-[#14b8a6] to-[#0d7377] shadow-lg scale-110"
                          : "bg-gradient-to-br from-gray-400 to-gray-600"
                      } transition-all`}
                    >
                      {dapatkanNamaEditor(editor).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${selectedEditor === editor.id ? "text-[#0d7377]" : "text-gray-900"}`}>
                        {dapatkanNamaEditor(editor)}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{editor.email}</p>
                      {selectedEditor === editor.id && (
                        <div className="mt-2 flex items-center gap-1 text-[#14b8a6]">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-semibold">Terpilih</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Catatan (Optional) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#14b8a6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Catatan untuk Editor
              <span className="text-sm font-normal text-gray-500">(Opsional)</span>
            </h2>

            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan atau instruksi khusus untuk editor..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <button
              onClick={() => router.back()}
              disabled={submitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              onClick={handleTugaskan}
              disabled={!selectedEditor || submitting}
              className="px-8 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d7377] text-white font-bold rounded-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menugaskan...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Tugaskan Review</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPORT WITH SUSPENSE
// ============================================

export default function TugaskanReviewPage() {
  return (
    <Suspense fallback={<SkeletonTugaskanReview />}>
      <TugaskanReviewContent />
    </Suspense>
  );
}
