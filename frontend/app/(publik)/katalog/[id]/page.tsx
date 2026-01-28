"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  User,
  Calendar,
  Tag,
  Hash,
  FileText,
  Share2,
  Loader2,
  BookMarked,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { naskahApi } from "@/lib/api/naskah";
import { getFileUrl } from "@/lib/utils";

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTanggal(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatBahasa(kode: string) {
  const bahasa: Record<string, string> = {
    id: "Indonesia",
    en: "English",
    ms: "Melayu",
    jv: "Jawa",
    su: "Sunda",
  };
  return bahasa[kode] || kode;
}

// ============================================
// PAGE COMPONENT
// ============================================

interface DetailBukuPageProps {
  params: Promise<{ id: string }>;
}

export default function DetailBukuPage({ params }: DetailBukuPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: response, isLoading } = useQuery({
    queryKey: ["detail-buku", id],
    queryFn: () => naskahApi.ambilNaskahById(id),
  });

  const buku = response?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-2 text-slate-600">Memuat detail buku...</span>
      </div>
    );
  }

  if (!buku) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-xl font-semibold text-slate-700 mb-2">
          Buku Tidak Ditemukan
        </h1>
        <p className="text-slate-500 mb-6">
          Buku yang Anda cari tidak tersedia atau sudah dihapus
        </p>
        <Button onClick={() => router.push("/katalog")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Katalog
        </Button>
      </div>
    );
  }

  const penulis =
    buku.penulis?.profilPengguna?.namaDepan ||
    buku.penulis?.email?.split("@")[0] ||
    "Anonim";

  const namaPenulis = buku.penulis?.profilPengguna
    ? `${buku.penulis.profilPengguna.namaDepan || ""} ${buku.penulis.profilPengguna.namaBelakang || ""}`.trim()
    : penulis;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/katalog"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cover & Quick Info */}
          <div className="lg:col-span-1">
            {/* Book Cover */}
            <div className="sticky top-8">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-teal-400 to-teal-600">
                {buku.urlSampul ? (
                  <Image
                    src={getFileUrl(buku.urlSampul)}
                    alt={buku.judul}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-24 h-24 text-white/50" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.share?.({
                      title: buku.judul,
                      text: buku.sinopsis,
                      url: window.location.href,
                    });
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Bagikan
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            {/* Title & Author */}
            <div className="mb-6">
              {buku.genre && (
                <Badge className="mb-3 bg-teal-100 text-teal-700 hover:bg-teal-200">
                  {buku.genre.nama}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {buku.judul}
              </h1>
              {buku.subJudul && (
                <p className="text-xl text-slate-600 mb-4">{buku.subJudul}</p>
              )}
              <div className="flex items-center gap-2 text-lg text-slate-700">
                <User className="w-5 h-5 text-teal-600" />
                <span>oleh</span>
                <span className="font-semibold text-teal-700">
                  {namaPenulis}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Book Info Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {buku.isbn && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Hash className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      ISBN
                    </p>
                    <p className="font-semibold text-slate-700">{buku.isbn}</p>
                  </div>
                </div>
              )}

              {buku.kategori && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Tag className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Kategori
                    </p>
                    <p className="font-semibold text-slate-700">
                      {buku.kategori.nama}
                    </p>
                  </div>
                </div>
              )}

              {buku.jumlahHalaman && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Jumlah Halaman
                    </p>
                    <p className="font-semibold text-slate-700">
                      {buku.jumlahHalaman} halaman
                    </p>
                  </div>
                </div>
              )}

              {buku.jumlahKata && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <BookMarked className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Jumlah Kata
                    </p>
                    <p className="font-semibold text-slate-700">
                      {buku.jumlahKata.toLocaleString("id-ID")} kata
                    </p>
                  </div>
                </div>
              )}

              {buku.bahasaTulis && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Languages className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Bahasa
                    </p>
                    <p className="font-semibold text-slate-700">
                      {formatBahasa(buku.bahasaTulis)}
                    </p>
                  </div>
                </div>
              )}

              {buku.diterbitkanPada && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Calendar className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Tanggal Terbit
                    </p>
                    <p className="font-semibold text-slate-700">
                      {formatTanggal(buku.diterbitkanPada)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Synopsis */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                Sinopsis
              </h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {buku.sinopsis}
                </p>
              </div>
            </div>

            {/* Author Bio (if available) */}
            {buku.penulis?.profilPengguna?.bio && (
              <>
                <Separator className="my-6" />
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-600" />
                    Tentang Penulis
                  </h2>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                      {buku.penulis.profilPengguna.urlAvatar ? (
                        <Image
                          src={getFileUrl(
                            buku.penulis.profilPengguna.urlAvatar,
                          )}
                          alt={namaPenulis}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {namaPenulis}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {buku.penulis.profilPengguna.bio}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
