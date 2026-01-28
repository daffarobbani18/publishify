"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  Clock,
  CreditCard,
  FileText,
  BookOpen,
  CheckCircle,
  AlertCircle,
  User,
  Loader2,
  Save,
  ChevronDown,
} from "lucide-react";
import penerbitanApi from "@/lib/api/penerbitan";
import type { PesananTerbit, UpdateStatusPesananDto } from "@/types/penerbitan";
import {
  LABEL_STATUS_PENERBITAN,
  LABEL_STATUS_PEMBAYARAN,
  TAHAPAN_PENERBITAN,
  ambilTahapanAktif,
  StatusPenerbitan,
  StatusPembayaranTerbit,
} from "@/types/penerbitan";
import { Button } from "@/components/ui/button";

// Daftar status untuk dropdown
const STATUS_OPTIONS: { value: StatusPenerbitan; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "menunggu_pembayaran", label: "Menunggu Pembayaran" },
  { value: "pembayaran_dikonfirmasi", label: "Pembayaran Dikonfirmasi" },
  { value: "naskah_dikirim", label: "Naskah Dikirim" },
  { value: "dalam_pemeriksaan", label: "Dalam Pemeriksaan" },
  { value: "perlu_revisi", label: "Perlu Revisi" },
  { value: "proses_editing", label: "Proses Editing" },
  { value: "proses_layout", label: "Proses Layout" },
  { value: "proses_isbn", label: "Proses ISBN" },
  { value: "siap_terbit", label: "Siap Terbit" },
  { value: "diterbitkan", label: "Diterbitkan" },
  { value: "dalam_distribusi", label: "Dalam Distribusi" },
];

/**
 * Halaman admin untuk detail dan update pesanan penerbitan
 */
export default function AdminDetailPesananPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [pesanan, setPesanan] = useState<PesananTerbit | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form state
  const [newStatus, setNewStatus] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [showStatusForm, setShowStatusForm] = useState(false);

  useEffect(() => {
    muatDetail();
  }, [id]);

  const muatDetail = async () => {
    try {
      const response = await penerbitanApi.ambilDetailPesanan(id);
      if (response.sukses) {
        setPesanan(response.data);
        setNewStatus(response.data.status);
      }
    } catch (error) {
      console.error("Gagal memuat detail:", error);
      toast.error("Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error("Pilih status baru");
      return;
    }

    setUpdating(true);
    try {
      const payload: UpdateStatusPesananDto = {
        status: newStatus,
        catatan: catatan || undefined,
      };

      const response = await penerbitanApi.updateStatusPesanan(id, payload);
      if (response.sukses) {
        toast.success("Status berhasil diperbarui");
        setPesanan(response.data);
        setShowStatusForm(false);
        setCatatan("");
      }
    } catch (error) {
      console.error("Gagal update status:", error);
      toast.error("Gagal memperbarui status");
    } finally {
      setUpdating(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      belum_bayar: "bg-red-100 text-red-700",
      menunggu_konfirmasi: "bg-amber-100 text-amber-700",
      lunas: "bg-green-100 text-green-700",
      dibatalkan: "bg-slate-100 text-slate-500",
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pesanan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-800 mb-2">
            Pesanan Tidak Ditemukan
          </h1>
          <Link href="/admin/pesanan-terbit">
            <Button>Kembali ke Daftar Pesanan</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tahapanAktif = ambilTahapanAktif(pesanan.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Pesanan #{pesanan.nomorPesanan}
              </h1>
              <p className="text-slate-600 mt-1">
                Dibuat pada {formatTanggal(pesanan.tanggalPesan)}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(pesanan.status)}`}
              >
                {LABEL_STATUS_PENERBITAN[pesanan.status]}
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getPembayaranColor(pesanan.statusPembayaran)}`}
              >
                {LABEL_STATUS_PEMBAYARAN[pesanan.statusPembayaran]}
              </span>
            </div>
          </div>
        </div>

        {/* Update Status Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Update Status
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatusForm(!showStatusForm)}
            >
              {showStatusForm ? "Tutup" : "Ubah Status"}
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${showStatusForm ? "rotate-180" : ""}`}
              />
            </Button>
          </div>

          {showStatusForm && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status Baru
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                  placeholder="Catatan untuk penulis..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Simpan Perubahan
              </Button>
            </div>
          )}
        </div>

        {/* Progress Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            Progress Penerbitan
          </h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {TAHAPAN_PENERBITAN.map((tahap, idx) => (
              <div key={tahap.id} className="flex items-center">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      tahapanAktif > tahap.id
                        ? "bg-green-500 border-green-500 text-white"
                        : tahapanAktif === tahap.id
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-slate-300 text-slate-400 bg-white"
                    }`}
                  >
                    {tahapanAktif > tahap.id ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-lg font-semibold">{tahap.id}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      tahapanAktif >= tahap.id
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {tahap.nama}
                  </span>
                </div>
                {idx < TAHAPAN_PENERBITAN.length - 1 && (
                  <div
                    className={`hidden md:block w-12 h-1 mx-2 rounded ${
                      tahapanAktif > tahap.id ? "bg-green-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informasi Penulis */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-500" />
              Informasi Penulis
            </h2>
            {pesanan.penulis ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Nama</p>
                  <p className="font-medium text-slate-800">
                    {pesanan.penulis.profilPengguna?.namaDepan || ""}{" "}
                    {pesanan.penulis.profilPengguna?.namaBelakang || ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium text-slate-800">
                    {pesanan.penulis.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Data penulis tidak tersedia</p>
            )}
          </div>

          {/* Informasi Naskah */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Informasi Naskah
            </h2>
            {pesanan.naskah ? (
              <div className="flex gap-4">
                {pesanan.naskah.urlSampul ? (
                  <img
                    src={pesanan.naskah.urlSampul}
                    alt={pesanan.naskah.judul}
                    className="w-16 h-24 object-cover rounded-lg shadow"
                  />
                ) : (
                  <div className="w-16 h-24 bg-slate-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {pesanan.naskah.judul}
                  </h3>
                  {pesanan.naskah.subJudul && (
                    <p className="text-sm text-slate-500">
                      {pesanan.naskah.subJudul}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 mt-2">
                    {pesanan.naskah.jumlahHalaman || "?"} halaman
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Data naskah tidak tersedia</p>
            )}
          </div>

          {/* Informasi Paket */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-500" />
              Paket Penerbitan
            </h2>
            {pesanan.paket ? (
              <div>
                <h3 className="font-semibold text-slate-800">
                  {pesanan.paket.nama}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {pesanan.paket.deskripsi}
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  {pesanan.paket.termasukLayoutDesain && (
                    <p className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" /> Layout & Desain
                    </p>
                  )}
                  {pesanan.paket.termasukISBN && (
                    <p className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" /> ISBN
                    </p>
                  )}
                  {pesanan.paket.termasukProofreading && (
                    <p className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" /> Proofreading
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Data paket tidak tersedia</p>
            )}
          </div>

          {/* Rincian Biaya */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Rincian Biaya
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Harga per Buku</span>
                <span className="text-slate-800">
                  {pesanan.paket ? formatHarga(pesanan.paket.harga) : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Jumlah Buku</span>
                <span className="text-slate-800">
                  {pesanan.jumlahBuku} buku
                </span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <span className="font-semibold text-slate-800">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatHarga(Number(pesanan.totalHarga))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bukti Pembayaran */}
        {pesanan.buktiPembayaran && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Bukti Pembayaran
            </h2>
            <div className="flex gap-4 items-start">
              <img
                src={pesanan.buktiPembayaran}
                alt="Bukti Pembayaran"
                className="max-w-md rounded-lg shadow border"
              />
              <div>
                <p className="text-sm text-slate-600">
                  Status:{" "}
                  <span className="font-medium">
                    {LABEL_STATUS_PEMBAYARAN[pesanan.statusPembayaran]}
                  </span>
                </p>
                {pesanan.statusPembayaran === "menunggu_konfirmasi" && (
                  <div className="mt-4 space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setNewStatus("pembayaran_dikonfirmasi");
                        setShowStatusForm(true);
                      }}
                    >
                      Konfirmasi Pembayaran
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Log Proses */}
        {pesanan.logProsesTerbit && pesanan.logProsesTerbit.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Riwayat Status
            </h2>
            <div className="space-y-4">
              {pesanan.logProsesTerbit.map((log) => (
                <div key={log.id} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {log.statusSebelumnya ? `${log.statusSebelumnya} → ` : ""}
                      {log.statusBaru}
                    </p>
                    {log.catatan && (
                      <p className="text-sm text-slate-600 mt-1">
                        {log.catatan}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {formatTanggal(log.dibuatPada)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
