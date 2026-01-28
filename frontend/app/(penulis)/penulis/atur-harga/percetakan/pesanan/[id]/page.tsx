/**
 * Detail & Tracking Pesanan - Penulis
 * Menampilkan detail lengkap pesanan dan timeline tracking
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getSampulUrl } from "@/lib/utils/url";
import {
  ArrowLeft,
  Package,
  BookOpen,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Download,
  AlertTriangle,
} from "lucide-react";
import type { PesananCetak, StatusPesanan } from "@/types/percetakan";

// Timeline Component
function Timeline({ status }: { status: StatusPesanan }) {
  const steps = [
    { key: "tertunda", label: "Tertunda", icon: Clock },
    { key: "diterima", label: "Diterima", icon: CheckCircle2 },
    { key: "dalam_produksi", label: "Produksi", icon: Package },
    { key: "kontrol_kualitas", label: "QC", icon: FileText },
    { key: "siap", label: "Siap", icon: CheckCircle2 },
    { key: "dikirim", label: "Dikirim", icon: Truck },
    { key: "terkirim", label: "Terkirim", icon: CheckCircle2 },
  ];

  const statusOrder = [
    "tertunda",
    "diterima",
    "dalam_produksi",
    "kontrol_kualitas",
    "siap",
    "dikirim",
    "terkirim",
  ];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200">
        <div
          className="bg-teal-600 transition-all duration-500"
          style={{
            height: `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
        ></div>
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isCompleted
                    ? "bg-teal-600 border-teal-600"
                    : "bg-white border-gray-300"
                } ${isCurrent ? "ring-4 ring-teal-100" : ""}`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isCompleted ? "text-white" : "text-gray-400"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <p
                  className={`font-medium ${
                    isCompleted ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-teal-600 mt-1">
                    Status saat ini
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancelled State */}
      {status === "dibatalkan" && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Pesanan Dibatalkan</p>
              <p className="text-sm text-red-700 mt-1">
                Pesanan ini telah dibatalkan
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DetailPesananPage() {
  const params = useParams();
  const router = useRouter();
  const pesananId = params.id as string;

  const [pesanan, setPesanan] = useState<PesananCetak | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (pesananId) {
      ambilDetailPesanan();
    }
  }, [pesananId]);

  async function ambilDetailPesanan() {
    try {
      setLoading(true);
      // TODO: API call
      // const response = await percetakanApi.ambilDetailPesanan(pesananId);
      // setPesanan(response.data);
    } catch (error) {
      console.error("Error loading pesanan:", error);
      alert("Gagal memuat detail pesanan");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelPesanan() {
    if (!cancelReason.trim()) {
      alert("Alasan pembatalan wajib diisi");
      return;
    }

    try {
      setCancelling(true);
      // TODO: API call
      // await percetakanApi.batalkanPesanan(pesananId, cancelReason);
      alert("Pesanan berhasil dibatalkan");
      ambilDetailPesanan();
      setShowCancelModal(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal membatalkan pesanan");
    } finally {
      setCancelling(false);
    }
  }

  function formatRupiah(angka: number | string): string {
    const num = typeof angka === "string" ? parseInt(angka) : angka;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  }

  function formatTanggal(tanggal: string): string {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (!pesanan) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Detail Pesanan
          </h1>
          <p className="text-gray-600 mt-1">{pesanan.nomorPesanan}</p>
        </div>

        {/* Action Buttons */}
        {pesanan.status === "tertunda" && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
          >
            <XCircle className="w-5 h-5" />
            Batalkan Pesanan
          </button>
        )}

        <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium">
          <Download className="w-5 h-5" />
          Download Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Naskah */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Informasi Naskah
              </h2>
            </div>

            <div className="flex gap-4">
              {pesanan.naskah?.urlSampul && (
                <div className="relative w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={getSampulUrl(pesanan.naskah.urlSampul)}
                    alt={pesanan.naskah.judul}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {pesanan.naskah?.judul || "N/A"}
                </h3>
                {pesanan.naskah?.subJudul && (
                  <p className="text-sm text-gray-600 mb-2">
                    {pesanan.naskah.subJudul}
                  </p>
                )}
                {pesanan.naskah?.isbn && (
                  <p className="text-sm text-gray-600">
                    <strong>ISBN:</strong> {pesanan.naskah.isbn}
                  </p>
                )}
                {pesanan.naskah?.jumlahHalaman && (
                  <p className="text-sm text-gray-600">
                    <strong>Jumlah Halaman:</strong>{" "}
                    {pesanan.naskah.jumlahHalaman} hal
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Spesifikasi Cetak */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Spesifikasi Cetak
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Jumlah Eksemplar</p>
                <p className="font-medium text-gray-900">{pesanan.jumlah} pcs</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Format Kertas</p>
                <p className="font-medium text-gray-900">{pesanan.formatKertas}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Jenis Kertas</p>
                <p className="font-medium text-gray-900">{pesanan.jenisKertas}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Jenis Cover</p>
                <p className="font-medium text-gray-900">{pesanan.jenisCover}</p>
              </div>
              {pesanan.catatan && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Catatan</p>
                  <p className="font-medium text-gray-900">{pesanan.catatan}</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Pemesan */}
          {pesanan.pemesan && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Informasi Pemesan
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {pesanan.pemesan.profilPengguna?.namaDepan || pesanan.pemesan.profilPengguna?.namaTampilan ||
                      pesanan.pemesan.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{pesanan.pemesan.email}</span>
                </div>
                {pesanan.pemesan.telepon && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{pesanan.pemesan.telepon}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Pengiriman */}
          {pesanan.pengiriman && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Informasi Pengiriman
                </h2>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Alamat Pengiriman</p>
                  <p className="text-gray-900">{pesanan.pengiriman.alamatTujuan}</p>
                </div>
                {pesanan.pengiriman.nomorResi && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nomor Resi</p>
                    <p className="font-mono text-teal-600">
                      {pesanan.pengiriman.nomorResi}
                    </p>
                  </div>
                )}
                {pesanan.pengiriman.namaEkspedisi && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ekspedisi</p>
                    <p className="text-gray-900">{pesanan.pengiriman.namaEkspedisi}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Status Pesanan
              </h2>
            </div>

            <Timeline status={pesanan.status} />
          </div>

          {/* Ringkasan Biaya */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
            <h3 className="font-semibold text-teal-900 mb-4">
              Ringkasan Biaya
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-teal-700">Harga Satuan:</span>
                <span className="font-medium text-teal-900">
                  {formatRupiah(Number(pesanan.hargaTotal) / pesanan.jumlah)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal-700">Jumlah:</span>
                <span className="font-medium text-teal-900">
                  {pesanan.jumlah} pcs
                </span>
              </div>
              <div className="h-px bg-teal-200"></div>
              <div className="flex justify-between">
                <span className="font-semibold text-teal-900">Total:</span>
                <span className="text-xl font-bold text-teal-600">
                  {formatRupiah(pesanan.hargaTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Tanggal Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Tanggal Pesanan</p>
                <p className="font-medium text-gray-900">
                  {formatTanggal(pesanan.tanggalPesan)}
                </p>
              </div>
              {pesanan.estimasiSelesai && (
                <div>
                  <p className="text-gray-500">Estimasi Selesai</p>
                  <p className="font-medium text-gray-900">
                    {formatTanggal(pesanan.estimasiSelesai)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Batalkan Pesanan
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Pesanan yang dibatalkan tidak dapat dikembalikan. Silakan berikan alasan pembatalan.
                </p>
              </div>
            </div>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Alasan pembatalan..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleCancelPesanan}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? "Memproses..." : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
