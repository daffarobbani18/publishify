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
  Search,
  Filter,
  ChevronRight,
  User,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import penerbitanApi from "@/lib/api/penerbitan";
import type {
  PesananTerbit,
  StatusPenerbitan,
  StatusPembayaranTerbit,
  FilterPesananDto,
} from "@/types/penerbitan";
import {
  LABEL_STATUS_PENERBITAN,
  LABEL_STATUS_PEMBAYARAN,
  ambilTahapanAktif,
} from "@/types/penerbitan";
import { Button } from "@/components/ui/button";

/**
 * Halaman admin untuk manajemen pesanan penerbitan
 */
export default function AdminPesananTerbitPage() {
  const [pesanan, setPesanan] = useState<PesananTerbit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterPesananDto>({
    halaman: 1,
    limit: 20,
  });
  const [metadata, setMetadata] = useState({
    total: 0,
    halaman: 1,
    limit: 20,
    totalHalaman: 1,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    muatPesanan();
  }, [filter]);

  const muatPesanan = async () => {
    setLoading(true);
    try {
      const response = await penerbitanApi.ambilSemuaPesanan(filter);
      if (response.sukses) {
        setPesanan(response.data);
        setMetadata(response.metadata);
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
      month: "short",
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

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setFilter((prev) => ({
      ...prev,
      status: status || undefined,
      halaman: 1,
    }));
  };

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "menunggu_pembayaran", label: "Menunggu Pembayaran" },
    { value: "pembayaran_dikonfirmasi", label: "Pembayaran OK" },
    { value: "dalam_pemeriksaan", label: "Dalam Pemeriksaan" },
    { value: "proses_editing", label: "Editing" },
    { value: "proses_layout", label: "Layout" },
    { value: "proses_isbn", label: "ISBN" },
    { value: "diterbitkan", label: "Diterbitkan" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Manajemen Pesanan Penerbitan
            </h1>
            <p className="text-slate-600 mt-1">
              Kelola dan pantau semua pesanan penerbitan dari penulis
            </p>
          </div>
          <Button
            onClick={muatPesanan}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor pesanan atau judul naskah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-800">
              {metadata.total}
            </div>
            <div className="text-sm text-slate-600">Total Pesanan</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-2xl font-bold text-amber-600">
              {pesanan.filter((p) => p.status === "menunggu_pembayaran").length}
            </div>
            <div className="text-sm text-slate-600">Menunggu Bayar</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {
                pesanan.filter((p) =>
                  ["proses_editing", "proses_layout", "proses_isbn"].includes(
                    p.status,
                  ),
                ).length
              }
            </div>
            <div className="text-sm text-slate-600">Dalam Proses</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {pesanan.filter((p) => p.status === "diterbitkan").length}
            </div>
            <div className="text-sm text-slate-600">Diterbitkan</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-600">Memuat data...</p>
            </div>
          ) : pesanan.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Tidak ada pesanan ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Pesanan
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Penulis
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Pembayaran
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Total
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                      Progress
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {pesanan.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-slate-800">
                            #{p.nomorPesanan}
                          </div>
                          <div className="text-sm text-slate-500 truncate max-w-[200px]">
                            {p.naskah?.judul || "Naskah"}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {formatTanggal(p.tanggalPesan)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700">
                            {p.penulis?.profilPengguna?.namaDepan ||
                              p.penulis?.email ||
                              "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}
                        >
                          {LABEL_STATUS_PENERBITAN[p.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center gap-1 text-sm font-medium ${getPembayaranColor(p.statusPembayaran)}`}
                        >
                          <CreditCard className="w-4 h-4" />
                          {LABEL_STATUS_PEMBAYARAN[p.statusPembayaran]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {formatHarga(Number(p.totalHarga))}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.jumlahBuku} buku
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((step) => (
                            <div
                              key={step}
                              className={`w-4 h-1.5 rounded-full ${
                                step <= ambilTahapanAktif(p.status)
                                  ? "bg-blue-500"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Tahap {ambilTahapanAktif(p.status)}/5
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/pesanan-terbit/${p.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            Detail
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {metadata.totalHalaman > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Halaman {metadata.halaman} dari {metadata.totalHalaman} (
                {metadata.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={metadata.halaman <= 1}
                  onClick={() =>
                    setFilter((prev) => ({
                      ...prev,
                      halaman: prev.halaman! - 1,
                    }))
                  }
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={metadata.halaman >= metadata.totalHalaman}
                  onClick={() =>
                    setFilter((prev) => ({
                      ...prev,
                      halaman: prev.halaman! + 1,
                    }))
                  }
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
