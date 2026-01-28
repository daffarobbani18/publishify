"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  ExternalLink,
  Settings,
  Printer,
  FileDown,
  Share2,
  Clock,
  Tag,
  Globe,
  Edit3,
  History,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { naskahApi } from "@/lib/api/naskah";
import { getSampulUrl, getFileNaskahUrl } from "@/lib/utils/url";

// Placeholder halaman detail buku terbit
export default function DetailBukuTerbitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [buku, setBuku] = useState<any>(null);
  const [id, setId] = useState<string | null>(null);

  // Unwrap params Promise
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Fetch data buku dari API
  useEffect(() => {
    const fetchBuku = async () => {
      if (!id || typeof id !== "string") return;
      setLoading(true);
      try {
        const res = await naskahApi.ambilNaskahById(id);
        const naskahData = res.data;

        // Validasi bahwa naskah sudah diterbitkan
        if (naskahData.status !== "diterbitkan") {
          toast.error("Buku ini belum diterbitkan");
          router.replace("/penulis/buku-terbit");
          return;
        }

        // Transform data untuk tampilan
        setBuku({
          id: naskahData.id,
          judul: naskahData.judul,
          subJudul: naskahData.subJudul,
          kategori: naskahData.kategori?.nama || "-",
          genre: naskahData.genre?.nama || "-",
          penulis:
            naskahData.penulis?.profilPengguna?.namaTampilan ||
            naskahData.penulis?.email ||
            "-",
          tanggalTerbit: naskahData.diterbitkanPada || naskahData.dibuatPada,
          isbn: naskahData.isbn || "-",
          sinopsis: naskahData.sinopsis,
          urlSampul: getSampulUrl(naskahData.urlSampul),
          urlFile: getFileNaskahUrl(naskahData.urlFile),
          halamanPublik: `${window.location.origin}/buku/${naskahData.id}`,
          jumlahHalaman: naskahData.jumlahHalaman || 0,
          formatBuku: naskahData.formatBuku || "A5",
          biayaProduksi: naskahData.biayaProduksi,
          hargaJual: naskahData.hargaJual,
          // TODO: Fetch riwayat cetak dari API pesanan cetak
          riwayatCetak: [],
        });
      } catch (e: any) {
        console.error("Gagal memuat detail buku:", e);
        toast.error("Gagal memuat detail buku");
        router.replace("/penulis/buku-terbit");
      } finally {
        setLoading(false);
      }
    };
    fetchBuku();
  }, [id, router]);

  // Loading state jika ID belum tersedia
  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (buku?.halamanPublik) {
      navigator.clipboard.writeText(buku.halamanPublik);
      toast.success("Link berhasil disalin!");
    }
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

      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
        {/* Panel Judul */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl px-6 sm:px-10 py-6 sm:py-8 overflow-hidden shadow-lg shadow-teal-500/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                <span className="text-3xl sm:text-4xl md:text-5xl">📚</span>
                Detail Buku Terbit
              </h1>
              <p className="text-base sm:text-lg text-teal-50">
                Informasi lengkap dan riwayat buku yang sudah diterbitkan
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:block ml-8">
              <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tombol Kembali */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="border-slate-200 bg-white hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : buku ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri - Info Buku */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informasi Buku */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-md border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-teal-600" />
                      Informasi Buku
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Diterbitkan
                      </Badge>
                      <span className="text-sm text-slate-500">
                        ID: {buku.id}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {buku.judul}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">
                          <span className="font-medium">Penulis:</span>{" "}
                          {buku.penulis}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">
                          <span className="font-medium">Terbit:</span>{" "}
                          {format(new Date(buku.tanggalTerbit), "d MMMM yyyy", {
                            locale: localeId,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">
                          <span className="font-medium">Kategori:</span>{" "}
                          {buku.kategori}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">
                          <span className="font-medium">Genre:</span>{" "}
                          {buku.genre}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">
                          <span className="font-medium">Halaman:</span>{" "}
                          {buku.jumlahHalaman}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">
                          <span className="font-medium">ISBN:</span> {buku.isbn}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-800 mb-2">
                        Sinopsis
                      </h3>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {buku.sinopsis}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Riwayat Cetak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-md border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <History className="h-5 w-5 text-teal-600" />
                      Riwayat Cetak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {buku.riwayatCetak && buku.riwayatCetak.length > 0 ? (
                      <div className="space-y-3">
                        {buku.riwayatCetak.map((cetak: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                {cetak.jenis === "Fisik" ? (
                                  <Printer className="w-5 h-5 text-teal-600" />
                                ) : (
                                  <FileDown className="w-5 h-5 text-teal-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  Cetak {cetak.jenis}
                                </div>
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {format(
                                    new Date(cetak.tanggal),
                                    "d MMM yyyy",
                                    { locale: localeId },
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-slate-900">
                                {cetak.jumlah} eksemplar
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {cetak.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">Belum ada riwayat cetak</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Kolom Kanan - Aksi & Tautan */}
            <div className="space-y-6">
              {/* Aksi Cepat */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-md border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => window.open(buku.halamanPublik, "_blank")}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Lihat Halaman Publik
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="w-full border-slate-300"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Bagikan Link
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(`/penulis/buku-terbit/${id}/cetak`)
                      }
                      variant="outline"
                      className="w-full border-slate-300"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Cetak Ulang
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-slate-300"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Metadata
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Tautan Publik */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-md border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-teal-600" />
                      Tautan Publik
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">URL Buku:</p>
                      <a
                        href={buku.halamanPublik}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {buku.halamanPublik}
                      </a>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      Bagikan link ini kepada pembaca untuk melihat detail buku
                      Anda
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sampul Buku */}
              {buku.urlSampul && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="shadow-md border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Sampul Buku</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img
                        src={buku.urlSampul}
                        alt="Sampul Buku"
                        className="rounded-lg shadow-md w-full object-cover aspect-[3/4]"
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">Buku tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
