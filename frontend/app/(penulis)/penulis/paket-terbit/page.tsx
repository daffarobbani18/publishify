"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Package,
  BookOpen,
  Check,
  X,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import penerbitanApi from "@/lib/api/penerbitan";
import type { PaketPenerbitan } from "@/types/penerbitan";
import { Button } from "@/components/ui/button";

/**
 * Halaman daftar paket penerbitan
 * Penulis dapat melihat dan memilih paket yang sesuai kebutuhan
 */
export default function PaketTerbitPage() {
  const router = useRouter();
  const [paket, setPaket] = useState<PaketPenerbitan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    muatPaket();
  }, []);

  const muatPaket = async () => {
    try {
      const response = await penerbitanApi.ambilSemuaPaket();
      if (response.sukses) {
        setPaket(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat paket:", error);
      toast.error("Gagal memuat daftar paket penerbitan");
    } finally {
      setLoading(false);
    }
  };

  const pilihPaket = (idPaket: string) => {
    router.push(`/penulis/pesanan-terbit/baru?paket=${idPaket}`);
  };

  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Pilih Paket Terbaik untuk Buku Anda
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Paket Penerbitan
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Pilih paket penerbitan yang sesuai dengan kebutuhan Anda. Setiap
            paket mencakup layanan lengkap dari editing hingga distribusi.
          </p>
        </div>

        {/* Alur Penerbitan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-10">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 text-center">
            Alur Penerbitan Buku
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {[
              { no: 1, label: "Pilih Paket" },
              { no: 2, label: "Kirim Naskah" },
              { no: 3, label: "Pemeriksaan" },
              { no: 4, label: "Proses Penerbitan" },
              { no: 5, label: "Distribusi" },
            ].map((step, idx) => (
              <div key={step.no} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
                    {step.no}
                  </span>
                  {step.label}
                </div>
                {idx < 4 && (
                  <ArrowRight className="w-5 h-5 text-slate-400 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Paket Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paket.map((p, index) => (
            <div
              key={p.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                index === 1
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-slate-200"
              }`}
            >
              {/* Popular badge */}
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    Paling Populer
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6 pt-2">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${
                      index === 0
                        ? "bg-slate-100 text-slate-600"
                        : index === 1
                          ? "bg-blue-100 text-blue-600"
                          : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{p.nama}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-slate-800">
                      {formatHarga(p.harga)}
                    </span>
                    <span className="text-slate-500 text-sm ml-1">/ buku</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Minimal {p.jumlahBukuMin} buku
                  </p>
                </div>

                {/* Deskripsi */}
                <p className="text-slate-600 text-sm mb-6 text-center line-clamp-3">
                  {p.deskripsi}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <FiturItem
                    aktif={p.termasukLayoutDesain}
                    label="Layout & Desain Sampul"
                  />
                  <FiturItem aktif={p.termasukISBN} label="Pengurusan ISBN" />
                  <FiturItem
                    aktif={p.termasukProofreading}
                    label="Proofreading (Typo, EYD, PUEBI)"
                  />
                  <FiturItem aktif={p.termasukEbook} label="Versi E-book" />
                  <FiturItem
                    aktif={true}
                    label={`${p.revisiMaksimal}x Revisi Minor`}
                  />
                </div>

                {/* Fitur Tambahan */}
                {p.fiturTambahan && p.fiturTambahan.length > 0 && (
                  <div className="border-t border-slate-200 pt-4 mb-6">
                    <p className="text-xs text-slate-500 mb-2 font-medium">
                      Bonus:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.fiturTambahan.map((fitur, i) => (
                        <span
                          key={i}
                          className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                        >
                          {fitur}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  onClick={() => pilihPaket(p.id)}
                  className={`w-full py-6 text-base font-medium transition-all ${
                    index === 1
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl"
                      : "bg-slate-800 hover:bg-slate-900 text-white"
                  }`}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Pilih Paket
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Catatan */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-800 mb-3">
            📋 Catatan Penting
          </h3>
          <ul className="text-sm text-amber-700 space-y-2">
            <li>
              • <strong>Proofreading</strong> hanya tersedia untuk paket 15+
              buku, mencakup editing typo, EYD, dan PUEBI
            </li>
            <li>
              • <strong>Revisi Minor</strong> mencakup perbaikan desain sampul
              dan/atau layout (tata letak)
            </li>
            <li>
              • Revisi di luar fasilitas paket akan dikenakan biaya tambahan
            </li>
            <li>
              • Perubahan konsep desain secara total atau penggantian naskah
              setelah layout bukan termasuk fasilitas revisi
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FiturItem({ aktif, label }: { aktif: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {aktif ? (
        <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3" />
        </div>
      ) : (
        <div className="w-5 h-5 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
          <X className="w-3 h-3" />
        </div>
      )}
      <span
        className={`text-sm ${aktif ? "text-slate-700" : "text-slate-400"}`}
      >
        {label}
      </span>
    </div>
  );
}
