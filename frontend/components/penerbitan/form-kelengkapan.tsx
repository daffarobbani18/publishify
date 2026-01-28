'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, FileCheck, CheckSquare, Square } from 'lucide-react';
import penerbitanApi from '@/lib/api/penerbitan';
import type { KelengkapanNaskahDto, KelengkapanNaskah } from '@/types/penerbitan';
import { LABEL_STATUS_KELENGKAPAN } from '@/types/penerbitan';
import { Button } from '@/components/ui/button';

interface FormKelengkapanProps {
  idPesanan: string;
  kelengkapan?: KelengkapanNaskah;
  dapatDiedit?: boolean;
  onUpdate?: () => void;
}

const DAFTAR_KELENGKAPAN = [
  {
    key: 'adaKataPengantar',
    label: 'Kata Pengantar',
    deskripsi: 'Kata pengantar dari penulis',
    wajib: true,
  },
  {
    key: 'adaDaftarIsi',
    label: 'Daftar Isi',
    deskripsi: 'Daftar isi lengkap',
    wajib: true,
  },
  {
    key: 'adaBabIsi',
    label: 'Bab Isi',
    deskripsi: 'Isi naskah lengkap',
    wajib: true,
  },
  {
    key: 'adaDaftarPustaka',
    label: 'Daftar Pustaka',
    deskripsi: 'Referensi dan sumber',
    wajib: false,
  },
  {
    key: 'adaTentangPenulis',
    label: 'Tentang Penulis',
    deskripsi: 'Biodata singkat penulis (150-200 kata)',
    wajib: true,
  },
  {
    key: 'adaSinopsis',
    label: 'Sinopsis',
    deskripsi: 'Ringkasan buku untuk sampul belakang',
    wajib: true,
  },
  {
    key: 'adaLampiran',
    label: 'Lampiran',
    deskripsi: 'Materi tambahan pendukung',
    wajib: false,
  },
];

/**
 * Form untuk kelengkapan naskah dengan checklist
 */
export default function FormKelengkapan({
  idPesanan,
  kelengkapan,
  dapatDiedit = true,
  onUpdate,
}: FormKelengkapanProps) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<KelengkapanNaskahDto>({
    adaKataPengantar: false,
    adaDaftarIsi: false,
    adaBabIsi: false,
    adaDaftarPustaka: false,
    adaTentangPenulis: false,
    adaSinopsis: false,
    adaLampiran: false,
  });

  useEffect(() => {
    if (kelengkapan) {
      setData({
        adaKataPengantar: kelengkapan.adaKataPengantar,
        adaDaftarIsi: kelengkapan.adaDaftarIsi,
        adaBabIsi: kelengkapan.adaBabIsi,
        adaDaftarPustaka: kelengkapan.adaDaftarPustaka,
        adaTentangPenulis: kelengkapan.adaTentangPenulis,
        adaSinopsis: kelengkapan.adaSinopsis,
        adaLampiran: kelengkapan.adaLampiran,
      });
    }
  }, [kelengkapan]);

  const handleToggle = (key: string) => {
    if (!dapatDiedit) return;
    setData((prev) => ({ ...prev, [key]: !prev[key as keyof KelengkapanNaskahDto] }));
  };

  const handleSimpan = async () => {
    setSaving(true);
    try {
      const response = await penerbitanApi.updateKelengkapanNaskah(idPesanan, data);
      if (response.sukses) {
        toast.success('Kelengkapan naskah berhasil disimpan');
        onUpdate?.();
      }
    } catch (error) {
      console.error('Gagal menyimpan:', error);
      toast.error('Gagal menyimpan kelengkapan naskah');
    } finally {
      setSaving(false);
    }
  };

  const totalWajib = DAFTAR_KELENGKAPAN.filter((k) => k.wajib).length;
  const terpenuhi = DAFTAR_KELENGKAPAN.filter(
    (k) => k.wajib && data[k.key as keyof KelengkapanNaskahDto]
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-500" />
            Kelengkapan Naskah
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tandai dokumen yang sudah Anda siapkan
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800">
            {terpenuhi}/{totalWajib}
          </div>
          <div className="text-xs text-slate-500">Wajib terpenuhi</div>
        </div>
      </div>

      {/* Status Verifikasi */}
      {kelengkapan && (
        <div
          className={`px-4 py-3 rounded-lg mb-6 ${
            kelengkapan.statusVerifikasi === 'lengkap'
              ? 'bg-green-50 border border-green-200'
              : kelengkapan.statusVerifikasi === 'tidak_lengkap'
                ? 'bg-red-50 border border-red-200'
                : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Status: {LABEL_STATUS_KELENGKAPAN[kelengkapan.statusVerifikasi]}
            </span>
          </div>
          {kelengkapan.catatanKelengkapan && (
            <p className="text-sm mt-2 text-slate-600">{kelengkapan.catatanKelengkapan}</p>
          )}
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-4">
        {DAFTAR_KELENGKAPAN.map((item) => (
          <div
            key={item.key}
            onClick={() => handleToggle(item.key)}
            className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
              dapatDiedit ? 'cursor-pointer hover:bg-slate-50' : ''
            } ${
              data[item.key as keyof KelengkapanNaskahDto]
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {data[item.key as keyof KelengkapanNaskahDto] ? (
                <CheckSquare className="w-6 h-6 text-green-600" />
              ) : (
                <Square className="w-6 h-6 text-slate-300" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{item.label}</span>
                {item.wajib && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                    Wajib
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">{item.deskripsi}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol Simpan */}
      {dapatDiedit && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <Button onClick={handleSimpan} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Simpan Kelengkapan
          </Button>
        </div>
      )}
    </div>
  );
}
