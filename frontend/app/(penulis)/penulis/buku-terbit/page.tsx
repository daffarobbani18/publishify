"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Eye,
  Settings,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react";
import { naskahApi, type Naskah } from "@/lib/api/naskah";

// Fungsi untuk mendapatkan sapaan berdasarkan waktu
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

// Type untuk buku terbit
interface BukuTerbit {
  id: string;
  judul: string;
  urlSampul?: string;
  terbitPada: string; // ISO date
  kategori?: string;
  genre?: string;
  isbn?: string;
  sinopsis?: string;
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
          terbitPada: naskah.diperbaruiPada, // Gunakan diperbaruiPada sebagai tanggal terbit
          kategori: (naskah as any).kategori?.nama,
          genre: (naskah as any).genre?.nama,
          isbn: (naskah as any).isbn,
          sinopsis: naskah.sinopsis,
        }));

        setBukuTerbit(buku);
      } catch (e: any) {
        console.error("Gagal memuat buku terbit:", e);
        toast.error("Gagal memuat buku terbit");
      } finally {
        setLoading(false);
      }
    };

    fetchBukuTerbit();
  }, []);

  const handleShare = (buku: BukuTerbit) => {
    // Share book via native share API or copy link
    const shareUrl = `${window.location.origin}/buku/${buku.id}`;
    if (navigator.share) {
      navigator.share({
        title: buku.judul,
        text: `Baca buku "${buku.judul}" di Publishify`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link berhasil disalin ke clipboard");
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 overflow-hidden shadow-lg shadow-teal-500/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          {/* Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1"
              >
                Buku Terbit
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs sm:text-sm md:text-base text-white/90"
              >
                Kelola buku yang telah diterbitkan secara digital
              </motion.p>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            Galeri buku yang sudah diterbitkan dan tersedia untuk pembaca
          </h2>
        </div>

        {/* Galeri Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden"
              >
                <div className="aspect-[3/4] bg-slate-200"></div>
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : bukuTerbit.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16 bg-white rounded-lg border border-slate-200"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <p className="text-slate-900 text-base sm:text-lg font-semibold mb-2">
              Belum ada buku terbit
            </p>
            <p className="text-slate-600 text-xs sm:text-sm">
              Naskah yang disetujui akan muncul di sini
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {bukuTerbit.map((buku, index) => (
              <motion.div
                key={buku.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 transition-all"
              >
                <div className="relative aspect-[3/4] bg-slate-100">
                  {buku.urlSampul ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={buku.urlSampul}
                      alt={`Sampul ${buku.judul}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                      <BookOpen className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-xs text-white/90 line-clamp-1">
                      {buku.kategori || "-"}{" "}
                      {buku.genre ? `• ${buku.genre}` : ""}
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] break-words">
                    {buku.judul}
                  </h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatTanggalIndo(buku.terbitPada)}
                  </div>

                  <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={`/penulis/buku-terbit/${buku.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-md transition-all text-xs sm:text-sm font-medium"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> Detail
                    </motion.a>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleShare(buku)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all text-xs sm:text-sm font-medium"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
