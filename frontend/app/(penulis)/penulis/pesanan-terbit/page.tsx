"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Plus,
  ChevronRight,
  BookOpen,
  CreditCard,
} from "lucide-react";
import penerbitanApi from "@/lib/api/penerbitan";
import type {
  PesananTerbit,
  StatusPenerbitan,
  StatusPembayaranTerbit,
} from "@/types/penerbitan";
import {
  LABEL_STATUS_PENERBITAN,
  LABEL_STATUS_PEMBAYARAN,
  ambilTahapanAktif,
} from "@/types/penerbitan";
import { Button } from "@/components/ui/button";

/**
 * Halaman daftar pesanan penerbitan milik penulis
 */
export default function PesananTerbitPage() {
  const [pesanan, setPesanan] = useState<PesananTerbit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    muatPesanan();
  }, []);

  const muatPesanan = async () => {
    try {
      const response = await penerbitanApi.ambilPesananSaya();
      if (response.sukses) {
        setPesanan(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat pesanan:", error);
      toast.error("Gagal memuat daftar pesanan");
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga);
  };

  const getStatusColor = (status: StatusPenerbitan) => {
    const colors: Record<string, string> = {
      draft: "bg-slate-100 text-slate-700",
      menunggu_pembayaran: "bg-amber-100 text-amber-700",
      pembayaran_dikonfirmasi: "bg-green-100 text-green-700",
      naskah_dikirim: "bg-blue-100 text-blue-700",
      dalam_pemeriksaan: "bg-purple-100 text-purple-700",
      perlu_revisi: "bg-red-100 text-red-700",
      proses_editing: "bg-indigo-100 text-indigo-700",
      proses_layout: "bg-cyan-100 text-cyan-700",
      proses_isbn: "bg-teal-100 text-teal-700",
      siap_terbit: "bg-emerald-100 text-emerald-700",
      diterbitkan: "bg-green-100 text-green-700",
      dalam_distribusi: "bg-blue-100 text-blue-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  const getPembayaranColor = (status: StatusPembayaranTerbit) => {
    const colors: Record<string, string> = {
      belum_bayar: "text-red-600",
      menunggu_konfirmasi: "text-amber-600",
      lunas: "text-green-600",
      dibatalkan: "text-slate-500",
    };
    return colors[status] || "text-slate-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-200 rounded w-1/3"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Pesanan Penerbitan
            </h1>
            <p className="text-slate-600 mt-1">
              Kelola dan pantau status pesanan penerbitan buku Anda
            </p>
          </div>
          <Link href="/penulis/paket-terbit">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Buat Pesanan Baru
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        {pesanan.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Belum Ada Pesanan
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Anda belum memiliki pesanan penerbitan. Mulai terbitkan buku Anda
              dengan memilih paket penerbitan.
            </p>
            <Link href="/penulis/paket-terbit">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <BookOpen className="w-4 h-4 mr-2" />
                Lihat Paket Penerbitan
              </Button>
            </Link>
          </div>
        ) : (
          /* Pesanan List */
          <div className="space-y-4">
            {pesanan.map((p) => (
              <Link
                key={p.id}
                href={`/penulis/pesanan-terbit/${p.id}`}
                className="block"
              >
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Sampul Buku */}
                      <div className="shrink-0">
                        {p.naskah?.urlSampul ? (
                          <img
                            src={p.naskah.urlSampul}
                            alt={p.naskah.judul}
                            className="w-20 h-28 object-cover rounded-lg shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-28 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}
                          >
                            {LABEL_STATUS_PENERBITAN[p.status]}
                          </span>
                          <span className="text-sm text-slate-500">
                            #{p.nomorPesanan}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800 truncate">
                          {p.naskah?.judul || "Naskah"}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {p.paket?.nama || "Paket"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTanggal(p.tanggalPesan)}
                          </span>
                          <span
                            className={`flex items-center gap-1 font-medium ${getPembayaranColor(p.statusPembayaran)}`}
                          >
                            <CreditCard className="w-4 h-4" />
                            {LABEL_STATUS_PEMBAYARAN[p.statusPembayaran]}
                          </span>
                        </div>
                      </div>

                      {/* Progress & Harga */}
                      <div className="shrink-0 text-right">
                        <div className="text-lg font-bold text-slate-800">
                          {formatHarga(Number(p.totalHarga))}
                        </div>
                        <div className="text-sm text-slate-500 mb-2">
                          {p.jumlahBuku} buku
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((step) => (
                            <div
                              key={step}
                              className={`w-6 h-1.5 rounded-full transition-colors ${
                                step <= ambilTahapanAktif(p.status)
                                  ? "bg-blue-500"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Tahap {ambilTahapanAktif(p.status)} dari 5
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-slate-400 hidden md:block" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
