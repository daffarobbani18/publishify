/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  User,
  Tag,
  FileText,
  ExternalLink,
  Share2,
  Download,
  Eye,
  BookMarked,
  Globe,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { naskahApi } from "@/lib/api/naskah";
import { getFileUrl } from "@/lib/utils";

interface DetailBukuPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailBukuPublikPage({ params }: DetailBukuPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [buku, setBuku] = useState<any>(null);

  useEffect(() => {
    const fetchBuku = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await naskahApi.ambilNaskahById(id);
        const naskahData = res.data;

        // Validasi bahwa naskah sudah diterbitkan
        if (naskahData.status !== "diterbitkan") {
          toast.error(
            "Buku ini belum diterbitkan atau tidak tersedia untuk publik",
          );
          router.replace("/katalog");
          return;
        }

        setBuku(naskahData);
      } catch (e: any) {
        console.error("Gagal memuat detail buku:", e);
        toast.error("Buku tidak ditemukan");
        router.replace("/katalog");
      } finally {
        setLoading(false);
      }
    };
    fetchBuku();
  }, [id, router]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link buku berhasil disalin!", {
      description: "Bagikan link ini ke teman-teman Anda",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="w-full aspect-[3/4] rounded-xl" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!buku) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/katalog")}
          className="mb-6 hover:bg-teal-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Katalog
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cover Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {buku.urlSampul ? (
                <img
                  src={getFileUrl(buku.urlSampul)}
                  alt={buku.judul}
                  className="w-full rounded-xl shadow-2xl border-4 border-white"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-gradient-to-br from-teal-200 to-cyan-300 rounded-xl shadow-2xl border-4 border-white flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-white" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full border-teal-300 hover:bg-teal-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Bagikan Buku
                </Button>

                {buku.urlFile && (
                  <Button
                    onClick={() =>
                      window.open(getFileUrl(buku.urlFile), "_blank")
                    }
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Preview
                  </Button>
                )}
              </div>

              {/* Stats Card */}
              <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-teal-600" />
                  Informasi Buku
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Format</span>
                    <span className="font-medium text-slate-900">
                      {buku.formatBuku || "A5"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-slate-600">Halaman</span>
                    <span className="font-medium text-slate-900">
                      {buku.jumlahHalaman || "-"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-slate-600">Kata</span>
                    <span className="font-medium text-slate-900">
                      {buku.jumlahKata?.toLocaleString("id-ID") || "-"}
                    </span>
                  </div>
                  {buku.isbn && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-slate-600">ISBN</span>
                        <span className="font-medium text-slate-900 text-xs">
                          {buku.isbn}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              {/* Title & Badges */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <Badge className="bg-green-100 text-green-800 border border-green-200">
                    <BookMarked className="h-3 w-3 mr-1" />
                    Diterbitkan
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-teal-200 text-teal-700"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Publik
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">
                  {buku.judul}
                </h1>

                {buku.subJudul && (
                  <h2 className="text-lg sm:text-xl text-slate-600 italic mb-4">
                    {buku.subJudul}
                  </h2>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  {buku.penulis && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1.5 text-slate-400" />
                      <span>
                        {buku.penulis.profilPengguna?.namaDepan}{" "}
                        {buku.penulis.profilPengguna?.namaBelakang || ""}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
                    <span>
                      Terbit:{" "}
                      {buku.diperbaruiPada
                        ? format(new Date(buku.diperbaruiPada), "d MMMM yyyy", {
                            locale: localeId,
                          })
                        : "-"}
                    </span>
                  </div>
                </div>

                {/* Category & Genre */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {buku.kategori && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {buku.kategori.nama}
                    </Badge>
                  )}
                  {buku.genre && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-50 text-purple-700"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      {buku.genre.nama}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Sinopsis */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-teal-600" />
                  Sinopsis
                </h3>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {buku.sinopsis}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {buku.bahasaTulis && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Informasi Tambahan
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start">
                        <Globe className="h-4 w-4 mr-2 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-slate-600">Bahasa</p>
                          <p className="font-medium text-slate-900">
                            {buku.bahasaTulis === "id"
                              ? "Indonesia"
                              : buku.bahasaTulis}
                          </p>
                        </div>
                      </div>
                      {buku.dibuatPada && (
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 mr-2 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-slate-600">Dibuat</p>
                            <p className="font-medium text-slate-900">
                              {format(
                                new Date(buku.dibuatPada),
                                "d MMMM yyyy",
                                {
                                  locale: localeId,
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* CTA Card */}
            <div className="mt-6 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-6 sm:p-8 text-white shadow-lg">
              <h3 className="text-2xl font-bold mb-2">
                Tertarik dengan buku ini?
              </h3>
              <p className="text-teal-50 mb-4">
                Hubungi penulis untuk informasi lebih lanjut tentang
                ketersediaan dan pemesanan buku ini.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleShare}
                  className="bg-white text-teal-700 hover:bg-teal-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Bagikan ke Teman
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/katalog")}
                  className="border-white text-white hover:bg-white/10"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Jelajahi Katalog
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
