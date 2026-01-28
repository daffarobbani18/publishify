"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  reviewApi,
  type Review,
  type FeedbackReview,
  type Rekomendasi,
} from "@/lib/api/review";
import { getFileUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DetailReviewPage() {
  const router = useRouter();
  const params = useParams();
  const idReview = params.id as string;

  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [showTerimaModal, setShowTerimaModal] = useState(false);
  const [showTolakModal, setShowTolakModal] = useState(false);
  const [showRekomendasiModal, setShowRekomendasiModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Form states
  const [alasanTolak, setAlasanTolak] = useState("");
  const [rekomendasi, setRekomendasi] = useState<Rekomendasi>("revisi");
  const [catatanRekomendasi, setCatatanRekomendasi] = useState("");

  // Feedback form
  const [bab, setBab] = useState("");
  const [halaman, setHalaman] = useState<number | undefined>(undefined);
  const [komentar, setKomentar] = useState("");

  useEffect(() => {
    fetchReview();
  }, [idReview]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.ambilReviewById(idReview);
      setReview(res.data);
      if (res.data.rekomendasi) {
        setRekomendasi(res.data.rekomendasi);
      }
    } catch (error: any) {
      console.error("Error fetching review:", error);
      toast.error("Gagal memuat detail review");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // HANDLE TERIMA TUGAS
  // ================================
  const handleTerimaTugas = async () => {
    setSubmitting(true);
    try {
      await reviewApi.perbaruiReview(idReview, {
        status: "dalam_proses",
      });
      toast.success("Tugas review berhasil diterima!");
      setShowTerimaModal(false);
      fetchReview();
    } catch (error: any) {
      toast.error(error.message || "Gagal menerima tugas");
    } finally {
      setSubmitting(false);
    }
  };

  // ================================
  // HANDLE TOLAK TUGAS
  // ================================
  const handleTolakTugas = async () => {
    if (!alasanTolak.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.batalkanReview(idReview, alasanTolak.trim());
      toast.success("Tugas review ditolak");
      setShowTolakModal(false);
      router.push("/editor/naskah");
    } catch (error: any) {
      toast.error(error.message || "Gagal menolak tugas");
    } finally {
      setSubmitting(false);
    }
  };

  // ================================
  // HANDLE SET REKOMENDASI
  // ================================
  const handleSetRekomendasi = async () => {
    if (!rekomendasi) {
      toast.error("Pilih rekomendasi terlebih dahulu");
      return;
    }

    if (!catatanRekomendasi.trim()) {
      toast.error("Catatan rekomendasi harus diisi (minimal 10 karakter)");
      return;
    }

    if (catatanRekomendasi.trim().length < 10) {
      toast.error("Catatan rekomendasi minimal 10 karakter");
      return;
    }

    setSubmitting(true);
    try {
      // Tambah feedback khusus untuk rekomendasi
      await reviewApi.tambahFeedback(idReview, {
        bab: `📋 REKOMENDASI: ${rekomendasi.toUpperCase()}`,
        komentar: catatanRekomendasi.trim(),
      });

      // Logic berbeda untuk setiap rekomendasi:
      if (rekomendasi === "revisi") {
        // REVISI: Update rekomendasi + status tetap 'dalam_proses'
        // Backend akan update: rekomendasi='revisi', status='dalam_proses', naskah.status='perlu_revisi'
        await reviewApi.perbaruiReview(idReview, {
          rekomendasi: "revisi",
          status: "dalam_proses",
          catatan: catatanRekomendasi.trim(), // ✅ Ubah dari catatanUmum ke catatan
        });

        toast.success(
          "✏️ Revisi diperlukan! Catatan telah dikirim ke penulis (Review masih dalam proses)",
        );
      } else {
        // SETUJUI/TOLAK: Submit review untuk menyelesaikan
        // Backend akan handle:
        // - "tolak" → status review 'dibatalkan' + status naskah 'ditolak'
        // - "setujui" → status review 'selesai' + status naskah 'disetujui'
        await reviewApi.submitReview(idReview, {
          rekomendasi: rekomendasi,
          catatan: catatanRekomendasi.trim(),
        });

        const successMessages = {
          setujui:
            "✅ Naskah disetujui! Review selesai (Status Naskah: Disetujui)",
          tolak:
            "❌ Naskah ditolak! Review dibatalkan (Status Naskah: Ditolak)",
        };
        toast.success(
          successMessages[rekomendasi] || "Rekomendasi berhasil ditetapkan",
        );
      }

      setShowRekomendasiModal(false);
      setCatatanRekomendasi("");

      // Redirect ke daftar review setelah selesai
      setTimeout(() => {
        router.push("/editor/review");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Gagal menetapkan rekomendasi");
    } finally {
      setSubmitting(false);
    }
  };

  // ================================
  // HANDLE TAMBAH FEEDBACK
  // ================================
  const handleTambahFeedback = async () => {
    if (!komentar.trim()) {
      toast.error("Komentar harus diisi (minimal 10 karakter)");
      return;
    }

    if (komentar.trim().length < 10) {
      toast.error("Komentar minimal 10 karakter");
      return;
    }

    setSubmitting(true);
    try {
      await reviewApi.tambahFeedback(idReview, {
        bab: bab.trim() || undefined,
        halaman: halaman || undefined,
        komentar: komentar.trim(),
      });
      toast.success("Feedback berhasil ditambahkan");
      setShowFeedbackModal(false);
      setBab("");
      setHalaman(undefined);
      setKomentar("");
      fetchReview();
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      ditugaskan: {
        label: "Ditugaskan",
        className: "bg-blue-100 text-blue-800",
      },
      dalam_proses: {
        label: "Dalam Proses",
        className: "bg-amber-100 text-amber-800",
      },
      selesai: { label: "Selesai", className: "bg-green-100 text-green-800" },
      dibatalkan: {
        label: "Dibatalkan",
        className: "bg-gray-100 text-gray-800",
      },
    };
    return badges[status] || badges.ditugaskan;
  };

  const rekomendasiBadge = (rek?: Rekomendasi) => {
    if (!rek) return null;
    const badges: Record<Rekomendasi, { label: string; className: string }> = {
      setujui: { label: "Disetujui", className: "bg-green-100 text-green-800" },
      revisi: {
        label: "Perlu Revisi",
        className: "bg-amber-100 text-amber-800",
      },
      tolak: { label: "Ditolak", className: "bg-red-100 text-red-800" },
    };
    const badge = badges[rek];
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="bg-white rounded-xl p-8 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!review) return null;

  const badge = statusBadge(review.status);
  const namaPenulis =
    review.naskah.penulis.profilPenulis?.namaPena ||
    `${review.naskah.penulis.profilPengguna?.namaDepan || ""} ${
      review.naskah.penulis.profilPengguna?.namaBelakang || ""
    }`.trim() ||
    review.naskah.penulis.email;

  // Kondisi tombol actions
  const isDitugaskan = review.status === "ditugaskan";
  const isDalamProses = review.status === "dalam_proses";
  const isSelesai = review.status === "selesai";
  const isDibatalkan = review.status === "dibatalkan";

  const canAddFeedback = isDitugaskan || isDalamProses;
  const canSetRekomendasi = isDalamProses; // Bisa set rekomendasi kapan saja saat dalam_proses

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition-colors border"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Review Naskah
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola review dan berikan feedback untuk naskah
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {rekomendasiBadge(review.rekomendasi)}
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Action Buttons - Workflow */}
        {!isSelesai && !isDibatalkan && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aksi Review
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* Tombol Terima Tugas (hanya saat ditugaskan) */}
              {isDitugaskan && (
                <>
                  <Button
                    onClick={() => setShowTerimaModal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Terima Tugas Review
                  </Button>
                  <Button
                    onClick={() => setShowTolakModal(true)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
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
                    Tolak Tugas
                  </Button>
                </>
              )}

              {/* Tombol Tambah Feedback (saat dalam proses) */}
              {canAddFeedback && (
                <Button
                  onClick={() => setShowFeedbackModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tambah Feedback
                </Button>
              )}

              {/* Tombol Set Rekomendasi & Selesaikan (saat dalam proses) */}
              {canSetRekomendasi && (
                <Button
                  onClick={() => setShowRekomendasiModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Selesaikan Review & Beri Rekomendasi
                </Button>
              )}
            </div>

            {/* Info helper */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Workflow:</strong>{" "}
                {isDitugaskan &&
                  "1️⃣ Terima tugas → 2️⃣ Tambah feedback → 3️⃣ Selesaikan review dengan rekomendasi"}
                {isDalamProses &&
                  "Tambah feedback sebanyak yang diperlukan → Klik 'Selesaikan Review' untuk memberikan rekomendasi final"}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Naskah */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex gap-6">
                {review.naskah.urlSampul ? (
                  <img
                    src={review.naskah.urlSampul}
                    alt={review.naskah.judul}
                    className="w-32 h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-purple-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {review.naskah.judul}
                  </h2>
                  {review.naskah.subJudul && (
                    <p className="text-gray-600 mb-4">
                      {review.naskah.subJudul}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="font-medium">{namaPenulis}</span>
                    </span>
                    {review.naskah.kategori && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {review.naskah.kategori.nama}
                      </span>
                    )}
                    {review.naskah.genre && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {review.naskah.genre.nama}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {review.naskah.sinopsis}
                  </p>
                </div>
              </div>
            </div>

            {/* Daftar Revisi Naskah */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-purple-600"
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
                Riwayat Revisi Naskah
              </h3>

              {review.naskah.revisi && review.naskah.revisi.length > 0 ? (
                <div className="space-y-3">
                  {review.naskah.revisi.map((revisi, index) => (
                    <div
                      key={revisi.id}
                      className={`border rounded-lg p-4 ${index === 0 ? "bg-green-50 border-green-200" : "bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              index === 0
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            Versi {revisi.versi}
                            {index === 0 && " (Terbaru)"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTanggal(revisi.dibuatPada)}
                          </span>
                        </div>
                        <a
                          href={getFileUrl(revisi.urlFile)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            index === 0
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
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
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Unduh
                        </a>
                      </div>
                      {revisi.catatan && (
                        <p className="text-sm text-gray-600 mt-2 pl-2 border-l-2 border-gray-300">
                          {revisi.catatan}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-2 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p>Belum ada revisi</p>
                  {review.naskah.urlFile && (
                    <a
                      href={getFileUrl(review.naskah.urlFile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Unduh File Naskah Asli
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Feedback List */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Daftar Feedback
              </h3>
              {review.feedback && review.feedback.length > 0 ? (
                <div className="space-y-4">
                  {review.feedback.map((fb) => (
                    <div key={fb.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {fb.bab && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                {fb.bab}
                              </span>
                              {fb.halaman && (
                                <span className="text-xs text-gray-600">
                                  Halaman {fb.halaman}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {fb.komentar}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTanggal(fb.dibuatPada)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-3 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  <p>Belum ada feedback</p>
                  <p className="text-sm mt-1">
                    Mulai tambahkan feedback untuk naskah ini
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline Review */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline Review
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Ditugaskan</p>
                    <p className="text-sm text-gray-600">
                      {formatTanggal(review.ditugaskanPada)}
                    </p>
                  </div>
                </div>

                {review.dimulaiPada && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-amber-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Dimulai</p>
                      <p className="text-sm text-gray-600">
                        {formatTanggal(review.dimulaiPada)}
                      </p>
                    </div>
                  </div>
                )}

                {review.selesaiPada && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Selesai</p>
                      <p className="text-sm text-gray-600">
                        {formatTanggal(review.selesaiPada)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistik */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Statistik
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Feedback</span>
                  <span className="font-bold text-gray-900">
                    {review.feedback?.length || 0}
                  </span>
                </div>
                {review.naskah.jumlahHalaman && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Jumlah Halaman</span>
                    <span className="font-bold text-gray-900">
                      {review.naskah.jumlahHalaman}
                    </span>
                  </div>
                )}
                {review.naskah.jumlahKata && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Jumlah Kata</span>
                    <span className="font-bold text-gray-900">
                      {review.naskah.jumlahKata.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL: Terima Tugas */}
        <Dialog open={showTerimaModal} onOpenChange={setShowTerimaModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Terima Tugas Review</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menerima tugas review untuk naskah "
                {review.naskah.judul}"? Status review akan berubah menjadi
                "Dalam Proses".
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleTerimaTugas}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitting ? "Memproses..." : "Ya, Terima Tugas"}
              </Button>
              <Button
                onClick={() => setShowTerimaModal(false)}
                variant="outline"
                disabled={submitting}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL: Tolak Tugas */}
        <Dialog open={showTolakModal} onOpenChange={setShowTolakModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tolak Tugas Review</DialogTitle>
              <DialogDescription>
                Berikan alasan mengapa Anda menolak tugas review ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan *
                </label>
                <textarea
                  value={alasanTolak}
                  onChange={(e) => setAlasanTolak(e.target.value)}
                  placeholder="Contoh: Tidak memiliki keahlian di genre ini"
                  className="w-full p-3 border rounded-lg min-h-[100px]"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleTolakTugas}
                  disabled={submitting || !alasanTolak.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {submitting ? "Memproses..." : "Tolak Tugas"}
                </Button>
                <Button
                  onClick={() => setShowTolakModal(false)}
                  variant="outline"
                  disabled={submitting}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL: Set Rekomendasi */}
        <Dialog
          open={showRekomendasiModal}
          onOpenChange={setShowRekomendasiModal}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Selesaikan Review & Beri Rekomendasi</DialogTitle>
              <DialogDescription>
                Pilih rekomendasi final untuk naskah ini. Tindakan ini akan
                menyelesaikan proses review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Info Status */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>⚠️ Perhatian:</strong> Pilih rekomendasi sesuai hasil
                  review Anda.
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
                  <li>
                    • <strong>Setujui/Tolak:</strong> Review akan diselesaikan
                    dan tidak dapat diubah
                  </li>
                  <li>
                    • <strong>Revisi:</strong> Review tetap aktif, menunggu
                    penulis melakukan revisi
                  </li>
                </ul>
              </div>

              {/* Pilih Rekomendasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rekomendasi *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setRekomendasi("setujui")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      rekomendasi === "setujui"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">✅</div>
                    <div className="font-semibold text-gray-900">Setujui</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Naskah layak terbit
                    </div>
                    <div className="text-xs text-green-600 font-medium mt-2">
                      → Status Naskah: <strong>Disetujui</strong>
                    </div>
                  </button>
                  <button
                    onClick={() => setRekomendasi("revisi")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      rekomendasi === "revisi"
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">✏️</div>
                    <div className="font-semibold text-gray-900">Revisi</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Perlu perbaikan
                    </div>
                    <div className="text-xs text-amber-600 font-medium mt-2">
                      → Review: <strong>Dalam Proses</strong>
                    </div>
                  </button>
                  <button
                    onClick={() => setRekomendasi("tolak")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      rekomendasi === "tolak"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">❌</div>
                    <div className="font-semibold text-gray-900">Tolak</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Tidak layak terbit
                    </div>
                    <div className="text-xs text-red-600 font-medium mt-2">
                      → Status Naskah: <strong>Ditolak</strong>
                    </div>
                  </button>
                </div>
              </div>

              {/* Catatan Rekomendasi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Rekomendasi *
                </label>
                <textarea
                  value={catatanRekomendasi}
                  onChange={(e) => setCatatanRekomendasi(e.target.value)}
                  placeholder="Jelaskan alasan rekomendasi Anda..."
                  className="w-full p-3 border rounded-lg min-h-[120px]"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Catatan ini akan dilihat oleh penulis dan admin
                  </p>
                  <p
                    className={`text-xs ${catatanRekomendasi.length >= 10 ? "text-green-600" : "text-gray-400"}`}
                  >
                    {catatanRekomendasi.length}/10 karakter
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSetRekomendasi}
                  disabled={
                    submitting ||
                    !rekomendasi ||
                    !catatanRekomendasi.trim() ||
                    catatanRekomendasi.length < 10
                  }
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {submitting ? "Memproses..." : "Selesaikan Review"}
                </Button>
                <Button
                  onClick={() => setShowRekomendasiModal(false)}
                  variant="outline"
                  disabled={submitting}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL: Tambah Feedback */}
        <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Feedback</DialogTitle>
              <DialogDescription>
                Berikan feedback untuk aspek tertentu dari naskah
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bab / Bagian (Opsional)
                </label>
                <input
                  type="text"
                  value={bab}
                  onChange={(e) => setBab(e.target.value)}
                  placeholder="Contoh: Bab 1, Pembukaan, Epilog"
                  className="w-full p-3 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sebutkan bagian naskah yang direview (opsional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Halaman (Opsional)
                </label>
                <input
                  type="number"
                  value={halaman || ""}
                  onChange={(e) =>
                    setHalaman(
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="Nomor halaman"
                  min="1"
                  className="w-full p-3 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nomor halaman yang direview (opsional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar / Feedback *
                </label>
                <textarea
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  placeholder="Tuliskan feedback detail Anda (minimal 10 karakter)..."
                  className="w-full p-3 border rounded-lg min-h-[150px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {komentar.length}/2000 karakter (minimal 10 karakter)
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleTambahFeedback}
                  disabled={submitting || komentar.trim().length < 10}
                  className="flex-1"
                >
                  {submitting ? "Menyimpan..." : "Tambah Feedback"}
                </Button>
                <Button
                  onClick={() => setShowFeedbackModal(false)}
                  variant="outline"
                  disabled={submitting}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
