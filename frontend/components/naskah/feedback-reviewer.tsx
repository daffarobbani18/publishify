"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { naskahApi } from "@/lib/api/naskah";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

// Tipe lokal untuk komponen ini
interface FeedbackReviewItem {
  id: string;
  bab?: string;
  halaman?: number;
  komentar: string;
  dibuatPada: string;
}

interface ReviewNaskahItem {
  id: string;
  status: string;
  rekomendasi: "setujui" | "revisi" | "tolak" | null;
  catatan?: string;
  ditugaskanPada: string;
  selesaiPada?: string;
  editor: {
    id: string;
    email: string;
    profilPengguna?: {
      namaTampilan?: string;
      urlAvatar?: string;
    };
  };
  feedback: FeedbackReviewItem[];
}

interface FeedbackDataLocal {
  naskah: {
    id: string;
    judul: string;
    status: string;
  };
  reviews: ReviewNaskahItem[];
  totalReview: number;
  reviewTerakhir: ReviewNaskahItem | null;
}

interface FeedbackReviewerProps {
  idNaskah: string;
  onRevisiReady?: () => void;
}

/**
 * Komponen untuk menampilkan feedback dari editor
 * Digunakan di halaman detail naskah penulis
 */
export function FeedbackReviewer({
  idNaskah,
  onRevisiReady,
}: FeedbackReviewerProps) {
  const [feedbackData, setFeedbackData] = useState<FeedbackDataLocal | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  useEffect(() => {
    const muatFeedback = async () => {
      try {
        setLoading(true);
        const response = await naskahApi.ambilFeedback(idNaskah);
        if (response.sukses && response.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setFeedbackData(response.data as any);
          // Expand review terakhir secara default
          if (response.data.reviewTerakhir) {
            setExpandedReview(response.data.reviewTerakhir.id);
          }
        }
      } catch (error: unknown) {
        console.error("Gagal memuat feedback:", error);
        // Tidak perlu toast error karena mungkin belum ada review
      } finally {
        setLoading(false);
      }
    };

    if (idNaskah) {
      muatFeedback();
    }
  }, [idNaskah]);

  // Konfigurasi badge rekomendasi
  const konfigurasiRekomendasi: Record<
    "setujui" | "revisi" | "tolak",
    { label: string; icon: typeof CheckCircle; warna: string }
  > = {
    setujui: {
      label: "Disetujui",
      icon: CheckCircle,
      warna: "bg-green-100 text-green-700 border-green-200",
    },
    revisi: {
      label: "Perlu Revisi",
      icon: AlertCircle,
      warna: "bg-amber-100 text-amber-700 border-amber-200",
    },
    tolak: {
      label: "Ditolak",
      icon: XCircle,
      warna: "bg-red-100 text-red-700 border-red-200",
    },
  };

  if (loading) {
    return (
      <Card className="shadow-md border-slate-200">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3 text-slate-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
            <span>Memuat feedback...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feedbackData || feedbackData.totalReview === 0) {
    return null; // Tidak tampilkan jika belum ada review
  }

  const toggleExpand = (reviewId: string) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
          <MessageSquare className="h-5 w-5 text-amber-600" />
          Hasil Review Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {feedbackData.reviews.map((review: ReviewNaskahItem) => {
          const isExpanded = expandedReview === review.id;
          const config = review.rekomendasi
            ? konfigurasiRekomendasi[review.rekomendasi]
            : null;

          return (
            <div
              key={review.id}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              {/* Header Review */}
              <button
                onClick={() => toggleExpand(review.id)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar Editor */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                    {review.editor.profilPengguna?.namaTampilan?.[0] ||
                      review.editor.email[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800">
                      {review.editor.profilPengguna?.namaTampilan ||
                        review.editor.email}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {review.selesaiPada
                        ? format(
                            new Date(review.selesaiPada),
                            "d MMMM yyyy, HH:mm",
                            { locale: localeId },
                          )
                        : "Dalam proses"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {config && (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.warna}`}
                    >
                      <config.icon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Konten Review */}
              {isExpanded && (
                <div className="p-4 space-y-4 border-t border-slate-100">
                  {/* Catatan Umum */}
                  {review.catatan && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Catatan Editor
                      </h4>
                      <p className="text-blue-700 text-sm whitespace-pre-line">
                        {review.catatan}
                      </p>
                    </div>
                  )}

                  {/* Daftar Feedback */}
                  {review.feedback.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-700 mb-3">
                        Detail Feedback ({review.feedback.length} item)
                      </h4>
                      <div className="space-y-3">
                        {review.feedback.map(
                          (fb: FeedbackReviewItem, index: number) => (
                            <div
                              key={fb.id}
                              className="bg-slate-50 border border-slate-100 rounded-lg p-3"
                            >
                              <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                  #{index + 1}
                                </span>
                                {fb.bab && (
                                  <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                                    Bab: {fb.bab}
                                  </span>
                                )}
                                {fb.halaman && (
                                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                    Hal: {fb.halaman}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 text-sm whitespace-pre-line">
                                {fb.komentar}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {review.feedback.length === 0 && !review.catatan && (
                    <p className="text-slate-500 text-sm text-center py-4">
                      Tidak ada feedback detail untuk review ini.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Tombol Aksi jika ada rekomendasi revisi */}
        {feedbackData.reviewTerakhir?.rekomendasi === "revisi" &&
          onRevisiReady && (
            <div className="pt-4 border-t border-slate-200">
              <Button
                onClick={onRevisiReady}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Mulai Revisi Naskah
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
