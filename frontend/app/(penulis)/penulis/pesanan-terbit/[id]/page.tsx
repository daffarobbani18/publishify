"use client";

import { useEffect, useState, use, useRef } from "react";
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
  Loader2,
  Upload,
  Image,
  Info,
} from "lucide-react";
import penerbitanApi from "@/lib/api/penerbitan";
import type { PesananTerbit } from "@/types/penerbitan";
import {
  LABEL_STATUS_PENERBITAN,
  LABEL_STATUS_PEMBAYARAN,
  TAHAPAN_PENERBITAN,
  ambilTahapanAktif,
  StatusPenerbitan,
  StatusPembayaranTerbit,
} from "@/types/penerbitan";
import { Button } from "@/components/ui/button";
import FormSpesifikasi from "@/components/penerbitan/form-spesifikasi";
import FormKelengkapan from "@/components/penerbitan/form-kelengkapan";

// Info rekening untuk pembayaran
const REKENING_INFO = {
  bank: "BCA",
  noRekening: "1234567890",
  atasNama: "PT Publishify Indonesia",
};

/**
 * Halaman detail pesanan penerbitan
 */
export default function DetailPesananPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pesanan, setPesanan] = useState<PesananTerbit | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    muatDetail();
  }, [id]);

  const muatDetail = async () => {
    try {
      const response = await penerbitanApi.ambilDetailPesanan(id);
      if (response.sukses) {
        setPesanan(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat detail:", error);
      toast.error("Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        toast.error("Hanya file gambar yang diperbolehkan");
        return;
      }
      // Validasi ukuran (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadBukti = async () => {
    if (!selectedFile) {
      toast.error("Pilih file bukti pembayaran terlebih dahulu");
      return;
    }

    setUploading(true);
    try {
      const response = await penerbitanApi.uploadBuktiPembayaran(
        id,
        selectedFile,
      );
      if (response.sukses) {
        toast.success("Bukti pembayaran berhasil diunggah!");
        setPesanan(response.data);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error("Gagal upload bukti:", error);
      toast.error("Gagal mengunggah bukti pembayaran");
    } finally {
      setUploading(false);
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
          <Link href="/penulis/pesanan-terbit">
            <Button>Kembali ke Daftar Pesanan</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tahapanAktif = ambilTahapanAktif(pesanan.status);
  const showUploadForm =
    pesanan.status === "menunggu_pembayaran" &&
    pesanan.statusPembayaran === "belum_bayar";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
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

        {/* Form Upload Bukti Pembayaran */}
        {showUploadForm && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pembayaran Transfer Bank
            </h2>

            {/* Info Rekening */}
            <div className="bg-white/70 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-700 mb-2">
                    Silakan transfer ke rekening berikut:
                  </p>
                  <div className="space-y-1 font-mono text-slate-800">
                    <p>
                      <span className="text-slate-500">Bank:</span>{" "}
                      {REKENING_INFO.bank}
                    </p>
                    <p>
                      <span className="text-slate-500">No. Rekening:</span>{" "}
                      <span className="font-bold text-lg">
                        {REKENING_INFO.noRekening}
                      </span>
                    </p>
                    <p>
                      <span className="text-slate-500">Atas Nama:</span>{" "}
                      {REKENING_INFO.atasNama}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-amber-700 mt-3">
                    Total: {formatHarga(Number(pesanan.totalHarga))}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview bukti transfer"
                      className="max-w-md max-h-64 rounded-lg shadow border"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUploadBukti}
                      disabled={uploading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {uploading ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Ganti Gambar
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-300 rounded-lg p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
                >
                  <Image className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-amber-700 font-medium">
                    Klik untuk upload bukti transfer
                  </p>
                  <p className="text-sm text-amber-600 mt-1">
                    Format: JPG, PNG, WebP (Maks. 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Menunggu Konfirmasi */}
        {pesanan.statusPembayaran === "menunggu_konfirmasi" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">
                  Menunggu Konfirmasi Pembayaran
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Bukti pembayaran Anda sedang diperiksa oleh admin. Proses
                  konfirmasi biasanya memakan waktu 1x24 jam kerja.
                </p>
                {pesanan.buktiPembayaran && (
                  <div className="mt-4">
                    <p className="text-sm text-blue-600 mb-2">
                      Bukti yang diunggah:
                    </p>
                    <img
                      src={pesanan.buktiPembayaran}
                      alt="Bukti pembayaran"
                      className="max-w-xs rounded-lg shadow border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
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
                    className="w-20 h-28 object-cover rounded-lg shadow"
                  />
                ) : (
                  <div className="w-20 h-28 bg-slate-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-slate-400" />
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

          {/* Status Proses */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Status Proses
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Editing</span>
                <span className="text-slate-800">{pesanan.statusEditing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Layout</span>
                <span className="text-slate-800">{pesanan.statusLayout}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Proofreading</span>
                <span className="text-slate-800">
                  {pesanan.statusProofreading}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">ISBN</span>
                <span className="text-slate-800">
                  {pesanan.isbn || pesanan.statusISBN}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Spesifikasi dan Kelengkapan */}
        {pesanan.statusPembayaran === "lunas" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <FormSpesifikasi
              idPesanan={pesanan.id}
              spesifikasi={pesanan.spesifikasi}
              dapatDiedit={[
                "pembayaran_dikonfirmasi",
                "naskah_dikirim",
              ].includes(pesanan.status)}
              onUpdate={muatDetail}
            />
            <FormKelengkapan
              idPesanan={pesanan.id}
              kelengkapan={pesanan.kelengkapan}
              dapatDiedit={[
                "pembayaran_dikonfirmasi",
                "naskah_dikirim",
                "dalam_pemeriksaan",
              ].includes(pesanan.status)}
              onUpdate={muatDetail}
            />
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
