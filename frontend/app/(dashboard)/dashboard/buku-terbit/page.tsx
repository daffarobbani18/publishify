"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookOpen, Calendar, Eye, Share2 } from "lucide-react";
import { naskahApi, type Naskah } from "@/lib/api/naskah";

// Type untuk buku terbit
interface BukuTerbit {
  id: string;
  judul: string;
  urlSampul?: string;
  terbitPada: string; // ISO date
  kategori?: string;
  genre?: string;
}

function formatTanggalIndo(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BukuTerbitPage() {
  const [loading, setLoading] = useState(true);
  const [bukuTerbit, setBukuTerbit] = useState<BukuTerbit[]>([]);

  // Fetch buku terbit dari API
  useEffect(() => {
    const fetchBukuTerbit = async () => {
      setLoading(true);
      try {
        // Ambil naskah dengan status "diterbitkan"
        const res = await naskahApi.ambilNaskahSaya({ status: "diterbitkan" });

        // Transform Naskah ke BukuTerbit
        const buku: BukuTerbit[] = (res.data || []).map((naskah: Naskah) => ({
          id: naskah.id,
          judul: naskah.judul,
          urlSampul: naskah.urlSampul,
          terbitPada: naskah.diperbaruiPada,
          kategori: (naskah as any).kategori?.nama,
          genre: (naskah as any).genre?.nama,
        }));

        setBukuTerbit(buku);
      } catch (e: unknown) {
        console.error("Gagal memuat buku terbit:", e);
        toast.error("Gagal memuat buku terbit");
      } finally {
        setLoading(false);
      }
    };

    fetchBukuTerbit();
  }, []);

  const handleShare = async (buku: BukuTerbit) => {
    const url = `${window.location.origin}/buku/${buku.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: buku.judul,
          text: `Baca buku "${buku.judul}" di Publishify`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link buku berhasil disalin!");
      }
    } catch (e) {
      console.error("Gagal share:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Buku Digital Terbit
            </h1>
          </div>
          <p className="text-gray-600">
            Koleksi buku digital yang sudah diterbitkan dan tersedia untuk
            dibaca
          </p>
        </div>

        {/* Galeri Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : bukuTerbit.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              Belum ada buku terbit
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Naskah yang disetujui akan muncul di sini
            </p>
            <Link
              href="/dashboard/naskah"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Lihat Daftar Naskah
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bukuTerbit.map((buku) => (
              <div
                key={buku.id}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Cover */}
                <div className="relative aspect-[3/4] bg-gray-100">
                  {buku.urlSampul ? (
                    <img
                      src={buku.urlSampul}
                      alt={`Sampul ${buku.judul}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-500">
                      <BookOpen className="w-12 h-12 text-white/80" />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-xs text-white/90 line-clamp-1">
                        {buku.kategori || "Umum"}{" "}
                        {buku.genre ? `• ${buku.genre}` : ""}
                      </div>
                    </div>
                  </div>
                  {/* Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
                      Terbit
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem] leading-snug">
                    {buku.judul}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatTanggalIndo(buku.terbitPada)}</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/dashboard/buku-terbit/${buku.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-all text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" /> Lihat Detail
                    </Link>
                    <button
                      onClick={() => handleShare(buku)}
                      className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      title="Bagikan"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
