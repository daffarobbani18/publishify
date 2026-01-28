"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FileCheck,
  Upload,
  Loader2,
  CheckCircle2,
  FileText,
  AlertCircle,
  BookOpen,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { uploadApi } from "@/lib/api/upload";
import { naskahApi, type Naskah } from "@/lib/api/naskah";
import { StatusNaskah } from "@/lib/constants/status-naskah";
import { getFileUrl } from "@/lib/utils";

interface KelengkapanFormProps {
  naskah: Naskah;
  onUpdate: () => void;
  readOnly?: boolean;
}

export function KelengkapanForm({
  naskah,
  onUpdate,
  readOnly = false,
}: KelengkapanFormProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [isbn, setIsbn] = useState(naskah.isbn || "");
  const [isbnSaving, setIsbnSaving] = useState(false);
  const [isbnError, setIsbnError] = useState<string | null>(null);

  const isEditable =
    !readOnly && (naskah.status as StatusNaskah) === "siap_terbit";

  // Validasi ISBN (10 atau 13 digit)
  const validateIsbn = (value: string): boolean => {
    if (!value.trim()) {
      setIsbnError("ISBN wajib diisi untuk penerbitan");
      return false;
    }
    const cleanIsbn = value.replace(/[-\s]/g, "");
    if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
      setIsbnError("ISBN harus 10 atau 13 digit");
      return false;
    }
    if (!/^\d+$/.test(cleanIsbn)) {
      setIsbnError("ISBN hanya boleh berisi angka");
      return false;
    }
    setIsbnError(null);
    return true;
  };

  const handleSaveIsbn = async () => {
    if (!validateIsbn(isbn)) return;

    setIsbnSaving(true);
    try {
      await naskahApi.perbaruiNaskah(naskah.id, {
        isbn: isbn.replace(/[-\s]/g, ""),
      });
      toast.success("ISBN berhasil disimpan");
      onUpdate();
    } catch (e: unknown) {
      const error = e as { message?: string };
      toast.error(error?.message || "Gagal menyimpan ISBN");
    } finally {
      setIsbnSaving(false);
    }
  };

  const handleUpload = async (
    file: File,
    field:
      | "urlSuratPerjanjian"
      | "urlSuratKeaslian"
      | "urlProposalNaskah"
      | "urlBuktiTransfer",
    label: string,
  ) => {
    setLoading(field);
    try {
      // Tentukan tipe file berdasarkan field
      const tipe =
        field === "urlBuktiTransfer" && file.type.startsWith("image/")
          ? "gambar"
          : "dokumen";

      const res = await uploadApi.uploadFile(
        file,
        tipe, // dokumen atau gambar
        `Kelengkapan: ${label} - ${naskah.judul}`,
      );

      // Update naskah dengan URL baru
      await naskahApi.perbaruiNaskah(naskah.id, {
        [field]: res.urlPublik || res.url,
      });

      toast.success(`${label} berhasil diunggah`);
      onUpdate();
    } catch (error: any) {
      toast.error(error?.message || `Gagal mengunggah ${label}`);
    } finally {
      setLoading(null);
    }
  };

  const DokumenItem = ({
    field,
    label,
    deskripsi,
    wajib = true,
  }: {
    field:
      | "urlSuratPerjanjian"
      | "urlSuratKeaslian"
      | "urlProposalNaskah"
      | "urlBuktiTransfer";
    label: string;
    deskripsi: string;
    wajib?: boolean;
  }) => {
    const url = naskah[field];
    const isUploading = loading === field;

    return (
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-xl bg-white hover:border-teal-200 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900">{label}</h4>
            {wajib && (
              <span className="text-xs text-red-500 font-medium">*Wajib</span>
            )}
            {url && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
          <p className="text-sm text-slate-500 mb-3">{deskripsi}</p>

          {url ? (
            <div className="flex items-center gap-3">
              <a
                href={getFileUrl(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <FileText className="w-4 h-4" />
                Lihat Dokumen
              </a>
              {isEditable && (
                <label className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                  (Ganti)
                  <input
                    type="file"
                    className="hidden"
                    accept={
                      field === "urlBuktiTransfer"
                        ? ".pdf,.jpg,.jpeg,.png"
                        : ".pdf,.docx"
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, field, label);
                    }}
                    disabled={!!loading}
                  />
                </label>
              )}
            </div>
          ) : isEditable ? (
            <label
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all
                ${
                  isUploading
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                }
              `}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? "Mengunggah..." : "Unggah Dokumen"}
              <input
                type="file"
                className="hidden"
                accept={
                  field === "urlBuktiTransfer"
                    ? ".pdf,.jpg,.jpeg,.png"
                    : ".pdf,.docx"
                }
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, field, label);
                }}
                disabled={!!loading}
              />
            </label>
          ) : (
            <span className="text-sm text-slate-400 italic flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Belum diunggah
            </span>
          )}
        </div>
      </div>
    );
  };

  if (
    (naskah.status as StatusNaskah) !== "siap_terbit" &&
    !naskah.urlSuratPerjanjian &&
    !naskah.urlSuratKeaslian &&
    !naskah.urlProposalNaskah &&
    !naskah.urlBuktiTransfer
  ) {
    return null;
  }

  return (
    <Card className="shadow-md border-slate-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileCheck className="h-5 w-5 text-teal-600" />
          Kelengkapan Dokumen Siap Terbit
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {isEditable && (
          <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Silakan lengkapi dokumen-dokumen berikut dan masukkan ISBN untuk
              memproses penerbitan naskah Anda. Pastikan dokumen yang diunggah
              valid dan dapat dibaca.
            </p>
          </div>
        )}

        {/* ISBN Input Section */}
        <div className="p-4 border rounded-xl bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-slate-900">Nomor ISBN</h4>
            <span className="text-xs text-red-500 font-medium">*Wajib</span>
            {naskah.isbn && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </div>
          <p className="text-sm text-slate-500 mb-3">
            Masukkan nomor ISBN yang sudah Anda urus di Perpustakaan Nasional
            (Perpusnas).
          </p>

          {isEditable ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  id="isbn"
                  placeholder="978-xxx-xxxx-xxx-x"
                  value={isbn}
                  onChange={(e) => {
                    setIsbn(e.target.value);
                    setIsbnError(null);
                  }}
                  className={isbnError ? "border-red-500" : ""}
                />
                {isbnError && (
                  <p className="text-sm text-red-500 mt-1">{isbnError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Format: ISBN-10 (10 digit) atau ISBN-13 (13 digit)
                </p>
              </div>
              <Button
                onClick={handleSaveIsbn}
                disabled={isbnSaving || !isbn}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isbnSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="ml-2">Simpan</span>
              </Button>
            </div>
          ) : naskah.isbn ? (
            <div className="flex items-center gap-2 text-sm font-mono bg-white border rounded-lg px-3 py-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              {naskah.isbn}
            </div>
          ) : (
            <span className="text-sm text-slate-400 italic flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Belum diisi
            </span>
          )}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DokumenItem
            field="urlSuratPerjanjian"
            label="Surat Perjanjian Penerbitan"
            deskripsi="Dokumen perjanjian kerjasama penerbitan yang telah ditandatangani."
          />
          <DokumenItem
            field="urlSuratKeaslian"
            label="Surat Pernyataan Keaslian"
            deskripsi="Surat pernyataan bahwa karya ini orisinil dan bebas plagiasi."
          />
          <DokumenItem
            field="urlProposalNaskah"
            label="Proposal Naskah"
            deskripsi="Proposal detail mengenai naskah, target pembaca, dan strategi pemasaran."
          />
          <DokumenItem
            field="urlBuktiTransfer"
            label="Bukti Transfer Biaya"
            deskripsi="Bukti pembayaran biaya paket penerbitan (jika ada)."
            wajib={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
