/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  User,
  Calendar,
  FileText,
  FileEdit,
  CheckCircle2,
  XCircle,
  Clock,
  FilePlus,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusTracker } from "@/components/naskah/status-tracker";
import {
  STATUS_NASKAH,
  type StatusNaskah,
  ambilKonfigurasiStatus,
} from "@/lib/constants/status-naskah";
import { naskahApi, type Naskah } from "@/lib/api/naskah";
import { getFileUrl } from "@/lib/utils";
import { KelengkapanForm } from "@/components/naskah/kelengkapan-form";
import { FeedbackReviewer } from "@/components/naskah/feedback-reviewer";
import { EditorRevisi } from "@/components/naskah/editor-revisi";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";

export default function DetailNaskahPage() {
  const params = useParams();
  const router = useRouter();
  const [naskah, setNaskah] = useState<Naskah | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const fetchNaskah = async () => {
    if (!params.idnaskah || typeof params.idnaskah !== "string") {
      toast.error("ID naskah tidak valid");
      router.replace("/penulis/draf");
      return;
    }

    setLoading(true);
    try {
      const res = await naskahApi.ambilNaskahById(params.idnaskah);
      if (res.sukses && res.data) {
        setNaskah(res.data);
        // Reset image states ketika naskah baru dimuat
        setImageError(false);
        setImageLoading(true);
      } else {
        throw new Error("Data naskah tidak ditemukan");
      }
    } catch (e: any) {
      const errorStatus = e?.response?.status;
      const errorMsg =
        e?.response?.data?.pesan || e?.message || "Gagal memuat detail naskah";

      if (errorStatus === 403) {
        toast.error(
          "Akses ditolak. Naskah ini mungkin sedang dalam proses review atau Anda tidak memiliki izin akses.",
        );
      } else {
        toast.error(errorMsg);
      }

      setTimeout(() => {
        router.replace("/penulis/draf");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNaskah();
  }, [params.idnaskah, router]);

  const muatUlang = () => {
    fetchNaskah();
  };

  // Gunakan konstanta status dari lib
  const ambilKonfigurasiStatus = (status: string) => {
    const s = status as StatusNaskah;
    return STATUS_NASKAH[s] || STATUS_NASKAH.draft;
  };

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden relative">
      {/* Background pola SVG */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-10"
        >
          <pattern
            id="polaPublishify"
            patternUnits="userSpaceOnUse"
            width="40"
            height="40"
          >
            <rect x="0" y="0" width="40" height="40" fill="white" />
            <path d="M0 20h40M20 0v40" stroke="#0d7377" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#polaPublishify)" />
        </svg>
      </div>
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Panel Judul */}
        <div className="relative w-full mb-8">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg shadow-teal-500/20 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
                Detail Naskah
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Informasi lengkap naskah dan status proses penerbitan
              </p>
            </div>
            <div className="flex-shrink-0 ml-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
        {/* Tombol Kembali */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="mb-4 border-slate-200 bg-white hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {/* Status Loading */}
        {loading && (
          <Card className="shadow-md border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-teal-600" />
                Data Naskah
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-2/3 rounded" />
                <Skeleton className="h-6 w-1/2 rounded" />
                <Skeleton className="h-6 w-1/3 rounded" />
                <Skeleton className="h-24 w-full rounded" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Konten Utama */}
        {!loading && naskah && (
          <div className="space-y-6">
            {/* Form Kelengkapan Dokumen (Jika status siap_terbit) */}
            <KelengkapanForm naskah={naskah} onUpdate={muatUlang} />

            {/* Feedback dari Editor (tampil jika ada review) */}
            <FeedbackReviewer idNaskah={naskah.id} />

            {/* Form Revisi (Jika status dalam_editing - editor minta revisi) */}
            {naskah.status === "dalam_editing" && (
              <EditorRevisi idNaskah={naskah.id} onSuccess={muatUlang} />
            )}

            <Card className="shadow-md border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-teal-600" />
                  Data Naskah
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Tracker Timeline */}
                <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-600" />
                    Progress Penerbitan
                  </h3>
                  <StatusTracker
                    statusSaatIni={naskah.status as StatusNaskah}
                    ukuran="sedang"
                    tampilkanLabel={true}
                    tampilkanDeskripsi={false}
                  />
                </div>

                {/* Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = ambilKonfigurasiStatus(naskah.status);
                      return (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${config.warnaBg} ${config.warnaTeks}`}
                        >
                          {config.label}
                        </span>
                      );
                    })()}
                    <span className="text-sm text-slate-500">
                      ID: {naskah.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      {naskah.penulis?.profilPengguna?.namaTampilan ||
                        naskah.penulis?.email ||
                        "-"}
                    </span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {naskah.judul}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Dibuat:{" "}
                    {format(new Date(naskah.dibuatPada), "d MMMM yyyy", {
                      locale: localeId,
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileEdit className="h-4 w-4" /> Diperbarui:{" "}
                    {format(new Date(naskah.diperbaruiPada), "d MMMM yyyy", {
                      locale: localeId,
                    })}
                  </span>
                  {naskah.isbn && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> ISBN: {naskah.isbn}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <FilePlus className="h-4 w-4" /> Kategori:{" "}
                    {naskah.kategori?.nama || "-"}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> Genre:{" "}
                    {naskah.genre?.nama || "-"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Halaman:{" "}
                    {naskah.jumlahHalaman || "-"}
                  </span>
                </div>
                {/* File PDF/Word */}
                {naskah.urlFile && (
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {naskah.urlFile.endsWith(".pdf") ? (
                        <svg
                          className="w-10 h-10 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <rect width="24" height="24" rx="4" fill="#fff" />
                          <path
                            d="M7 7h10v10H7V7z"
                            stroke="#ef4444"
                            strokeWidth="2"
                          />
                          <text
                            x="12"
                            y="17"
                            textAnchor="middle"
                            fontSize="8"
                            fill="#ef4444"
                            fontWeight="bold"
                          >
                            PDF
                          </text>
                        </svg>
                      ) : (
                        <svg
                          className="w-10 h-10 text-blue-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <rect width="24" height="24" rx="4" fill="#fff" />
                          <path
                            d="M7 7h10v10H7V7z"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                          <text
                            x="12"
                            y="17"
                            textAnchor="middle"
                            fontSize="8"
                            fill="#3b82f6"
                            fontWeight="bold"
                          >
                            DOC
                          </text>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 mb-1">
                        File Naskah
                      </div>
                      <a
                        href={getFileUrl(naskah.urlFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {naskah.urlFile.split("/").pop()}
                      </a>
                    </div>
                    <a
                      href={getFileUrl(naskah.urlFile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-xs hover:bg-blue-100 transition"
                    >
                      Unduh
                    </a>
                  </div>
                )}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 mb-2">
                    Sinopsis
                  </h3>
                  <p className="text-slate-700 whitespace-pre-line">
                    {naskah.sinopsis}
                  </p>
                </div>

                {/* Sampul Naskah */}
                {naskah.urlSampul && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-teal-600" />
                      Sampul Naskah
                    </h3>
                    <div className="w-full max-w-xs mx-auto relative">
                      {imageLoading && !imageError && (
                        <div className="absolute inset-0 bg-slate-100 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        </div>
                      )}
                      {imageError ? (
                        <div className="w-full aspect-[3/4] bg-slate-100 rounded-lg flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300">
                          <ImageIcon className="h-12 w-12 text-slate-400" />
                          <p className="text-sm text-slate-500">
                            Gagal memuat sampul
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImageError(false);
                              setImageLoading(true);
                            }}
                          >
                            Coba Lagi
                          </Button>
                        </div>
                      ) : (
                        <img
                          src={naskah.urlSampul}
                          alt={`Sampul ${naskah.judul}`}
                          className="rounded-lg shadow-md w-full object-cover aspect-[3/4]"
                          onLoad={() => setImageLoading(false)}
                          onError={() => {
                            setImageError(true);
                            setImageLoading(false);
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!loading && !naskah && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl shadow-md border-slate-200 p-8">
            Naskah tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
