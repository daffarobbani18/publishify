"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Package,
  Settings,
  CreditCard,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import penerbitanApi from "@/lib/api/penerbitan";
import { naskahApi, Naskah } from "@/lib/api/naskah";
import type { PaketPenerbitan, BuatPesananTerbitDto } from "@/types/penerbitan";
import { Button } from "@/components/ui/button";

// Tahapan wizard
const STEPS = [
  { id: 1, nama: "Pilih Naskah", icon: FileText },
  { id: 2, nama: "Pilih Paket", icon: Package },
  { id: 3, nama: "Spesifikasi", icon: Settings },
  { id: 4, nama: "Konfirmasi", icon: CreditCard },
];

function WizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paketIdFromUrl = searchParams.get("paket");

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [naskahList, setNaskahList] = useState<Naskah[]>([]);
  const [paketList, setPaketList] = useState<PaketPenerbitan[]>([]);

  // Selection
  const [selectedNaskah, setSelectedNaskah] = useState<Naskah | null>(null);
  const [selectedPaket, setSelectedPaket] = useState<PaketPenerbitan | null>(
    null,
  );
  const [jumlahBuku, setJumlahBuku] = useState(10);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    muatData();
  }, []);

  useEffect(() => {
    // Auto-select paket jika ada di URL
    if (paketIdFromUrl && paketList.length > 0) {
      const paket = paketList.find((p) => p.id === paketIdFromUrl);
      if (paket) {
        setSelectedPaket(paket);
        if (selectedNaskah) {
          setCurrentStep(2);
        }
      }
    }
  }, [paketIdFromUrl, paketList, selectedNaskah]);

  const muatData = async () => {
    try {
      // Ambil naskah yang sudah disetujui/diterbitkan
      const [naskahRes, paketRes] = await Promise.all([
        naskahApi.ambilNaskahSaya({ status: "disetujui" }),
        penerbitanApi.ambilSemuaPaket(),
      ]);

      if (naskahRes.sukses) {
        setNaskahList(naskahRes.data);
      }
      if (paketRes.sukses) {
        setPaketList(paketRes.data);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedNaskah || !selectedPaket) {
      toast.error("Pilih naskah dan paket terlebih dahulu");
      return;
    }

    if (jumlahBuku < selectedPaket.jumlahBukuMin) {
      toast.error(`Jumlah buku minimum adalah ${selectedPaket.jumlahBukuMin}`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: BuatPesananTerbitDto = {
        idNaskah: selectedNaskah.id,
        idPaket: selectedPaket.id,
        jumlahBuku,
        catatanPenulis: catatan || undefined,
      };

      const response = await penerbitanApi.buatPesananTerbit(payload);
      if (response.sukses) {
        toast.success("Pesanan berhasil dibuat!");
        router.push(`/penulis/pesanan-terbit/${response.data.id}`);
      }
    } catch (error: unknown) {
      console.error("Gagal membuat pesanan:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Gagal membuat pesanan";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatHarga = (harga: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga);
  };

  const totalHarga = selectedPaket ? selectedPaket.harga * jumlahBuku : 0;

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedNaskah !== null;
      case 2:
        return selectedPaket !== null;
      case 3:
        return selectedPaket && jumlahBuku >= selectedPaket.jumlahBukuMin;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-200 rounded w-1/3"></div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Buat Pesanan Penerbitan
          </h1>
          <p className="text-slate-600 mt-1">
            Ikuti langkah-langkah berikut untuk membuat pesanan baru
          </p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    currentStep >= step.id ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep > step.id
                        ? "bg-blue-600 border-blue-600 text-white"
                        : currentStep === step.id
                          ? "border-blue-600 text-blue-600"
                          : "border-slate-300 text-slate-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="hidden md:block font-medium">
                    {step.nama}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-0.5 mx-2 ${
                      currentStep > step.id ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          {/* Step 1: Pilih Naskah */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Pilih Naskah untuk Diterbitkan
              </h2>
              {naskahList.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <p className="text-slate-600">
                    Tidak ada naskah yang sudah disetujui.
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Ajukan naskah Anda untuk review terlebih dahulu.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {naskahList.map((naskah) => (
                    <div
                      key={naskah.id}
                      onClick={() => setSelectedNaskah(naskah)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedNaskah?.id === naskah.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex gap-4">
                        {naskah.urlSampul ? (
                          <img
                            src={naskah.urlSampul}
                            alt={naskah.judul}
                            className="w-16 h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-slate-200 rounded flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {naskah.judul}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2">
                            {naskah.sinopsis}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            {naskah.jumlahHalaman || "?"} halaman
                          </p>
                        </div>
                        {selectedNaskah?.id === naskah.id && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Pilih Paket */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Pilih Paket Penerbitan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paketList.map((paket) => (
                  <div
                    key={paket.id}
                    onClick={() => {
                      setSelectedPaket(paket);
                      setJumlahBuku(paket.jumlahBukuMin);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPaket?.id === paket.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800">
                        {paket.nama}
                      </h3>
                      {selectedPaket?.id === paket.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-2xl font-bold text-slate-800 mb-1">
                      {formatHarga(paket.harga)}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">
                      Min. {paket.jumlahBukuMin} buku
                    </p>
                    <div className="space-y-1 text-sm text-slate-600">
                      {paket.termasukLayoutDesain && (
                        <p className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" /> Layout &
                          Desain
                        </p>
                      )}
                      {paket.termasukISBN && (
                        <p className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" /> ISBN
                        </p>
                      )}
                      {paket.termasukProofreading && (
                        <p className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-600" />{" "}
                          Proofreading
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Spesifikasi */}
          {currentStep === 3 && selectedPaket && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Tentukan Jumlah & Catatan
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Jumlah Buku
                  </label>
                  <input
                    type="number"
                    min={selectedPaket.jumlahBukuMin}
                    value={jumlahBuku}
                    onChange={(e) => setJumlahBuku(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Minimum {selectedPaket.jumlahBukuMin} buku
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={4}
                    placeholder="Tuliskan catatan atau permintaan khusus..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Konfirmasi */}
          {currentStep === 4 && selectedNaskah && selectedPaket && (
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Konfirmasi Pesanan
              </h2>
              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-600">Naskah</span>
                  <span className="font-semibold text-slate-800">
                    {selectedNaskah.judul}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-600">Paket</span>
                  <span className="font-semibold text-slate-800">
                    {selectedPaket.nama}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-600">Harga per Buku</span>
                  <span className="font-semibold text-slate-800">
                    {formatHarga(selectedPaket.harga)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <span className="text-slate-600">Jumlah Buku</span>
                  <span className="font-semibold text-slate-800">
                    {jumlahBuku} buku
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold text-slate-800">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatHarga(totalHarga)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sebelumnya
          </Button>
          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
              disabled={!canGoNext()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Selanjutnya
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Memproses..." : "Buat Pesanan"}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuatPesananTerbitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-slate-200 rounded w-1/3"></div>
              <div className="h-96 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      }
    >
      <WizardContent />
    </Suspense>
  );
}
