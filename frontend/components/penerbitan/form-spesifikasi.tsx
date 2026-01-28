"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2, Settings2 } from "lucide-react";
import penerbitanApi from "@/lib/api/penerbitan";
import type { SpesifikasiBukuDto, SpesifikasiBuku } from "@/types/penerbitan";
import {
  LABEL_JENIS_SAMPUL,
  LABEL_JENIS_KERTAS,
  LABEL_JENIS_JILID,
} from "@/types/penerbitan";
import { Button } from "@/components/ui/button";

interface FormSpesifikasiProps {
  idPesanan: string;
  spesifikasi?: SpesifikasiBuku;
  dapatDiedit?: boolean;
  onUpdate?: () => void;
}

// Opsi ukuran buku standar
const UKURAN_BUKU = [
  { value: "A4", label: "A4 (21 x 29.7 cm)" },
  { value: "A5", label: "A5 (14.8 x 21 cm)" },
  { value: "B5", label: "B5 (17.6 x 25 cm)" },
  { value: "UNESCO", label: "UNESCO (15.5 x 23 cm)" },
  { value: "NOVEL", label: "Novel (13 x 19 cm)" },
];

/**
 * Form untuk spesifikasi buku (ukuran, jenis kertas, sampul, dll)
 */
export default function FormSpesifikasi({
  idPesanan,
  spesifikasi,
  dapatDiedit = true,
  onUpdate,
}: FormSpesifikasiProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SpesifikasiBukuDto>({
    ukuranBuku: "A5",
    jenisSampul: "softcover",
    jenisKertas: "hvs_80",
    jenisJilid: "lem_panas",
  });

  useEffect(() => {
    if (spesifikasi) {
      setFormData({
        ukuranBuku: spesifikasi.ukuranBuku,
        jenisSampul: spesifikasi.jenisSampul,
        jenisKertas: spesifikasi.jenisKertas,
        jenisJilid: spesifikasi.jenisJilid,
        laminasi: spesifikasi.laminasi,
        catatanTambahan: spesifikasi.catatanTambahan,
      });
    }
  }, [spesifikasi]);

  const handleChange = (
    field: keyof SpesifikasiBukuDto,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSimpan = async () => {
    setSaving(true);
    try {
      const response = await penerbitanApi.updateSpesifikasiBuku(
        idPesanan,
        formData,
      );
      if (response.sukses) {
        toast.success("Spesifikasi buku berhasil disimpan");
        onUpdate?.();
      }
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      toast.error("Gagal menyimpan spesifikasi buku");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-purple-500" />
        Spesifikasi Buku
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ukuran Buku */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Ukuran Buku
          </label>
          <select
            value={formData.ukuranBuku || "A5"}
            onChange={(e) => handleChange("ukuranBuku", e.target.value)}
            disabled={!dapatDiedit}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          >
            {UKURAN_BUKU.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Jenis Sampul */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Jenis Sampul
          </label>
          <select
            value={formData.jenisSampul || "softcover"}
            onChange={(e) => handleChange("jenisSampul", e.target.value)}
            disabled={!dapatDiedit}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          >
            {Object.entries(LABEL_JENIS_SAMPUL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Jenis Kertas */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Jenis Kertas
          </label>
          <select
            value={formData.jenisKertas || "hvs_80"}
            onChange={(e) => handleChange("jenisKertas", e.target.value)}
            disabled={!dapatDiedit}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          >
            {Object.entries(LABEL_JENIS_KERTAS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Jenis Jilid */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Jenis Jilid
          </label>
          <select
            value={formData.jenisJilid || "lem_panas"}
            onChange={(e) => handleChange("jenisJilid", e.target.value)}
            disabled={!dapatDiedit}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
          >
            {Object.entries(LABEL_JENIS_JILID).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catatan */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Catatan Tambahan (Opsional)
        </label>
        <textarea
          value={formData.catatanTambahan || ""}
          onChange={(e) => handleChange("catatanTambahan", e.target.value)}
          disabled={!dapatDiedit}
          rows={3}
          placeholder="Catatan tambahan untuk spesifikasi buku..."
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
        />
      </div>

      {/* Tombol Simpan */}
      {dapatDiedit && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <Button
            onClick={handleSimpan}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Simpan Spesifikasi
          </Button>
        </div>
      )}
    </div>
  );
}
