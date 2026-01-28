/**
 * Konstanta Status Naskah
 * Mendefinisikan 5 tahap penerbitan naskah dengan info lengkap
 */

import {
  Send,
  Search,
  Edit3,
  FileCheck,
  BookOpen,
  XCircle,
  FileText,
} from "lucide-react";

// Tipe status naskah sesuai dengan enum di backend
export type StatusNaskah =
  | "draft"
  | "diajukan"
  | "dalam_review"
  | "dalam_editing"
  | "siap_terbit"
  | "diterbitkan"
  | "ditolak";

// Interface untuk konfigurasi status
export interface KonfigurasiStatus {
  label: string;
  deskripsi: string;
  warnaBg: string;
  warnaTeks: string;
  warnaRing: string;
  step: number; // 0 = draft/ditolak (bukan bagian flow utama), 1-5 = tahap flow
  icon: typeof Send;
  isFlowStatus: boolean; // Apakah termasuk dalam flow 5 tahap
}

/**
 * Konfigurasi lengkap untuk setiap status naskah
 */
export const STATUS_NASKAH: Record<StatusNaskah, KonfigurasiStatus> = {
  draft: {
    label: "Draft",
    deskripsi: "Naskah masih dalam tahap penulisan",
    warnaBg: "bg-slate-100",
    warnaTeks: "text-slate-700",
    warnaRing: "ring-slate-200",
    step: 0,
    icon: FileText,
    isFlowStatus: false,
  },
  diajukan: {
    label: "Diajukan",
    deskripsi: "Naskah sudah disubmit untuk review",
    warnaBg: "bg-blue-100",
    warnaTeks: "text-blue-700",
    warnaRing: "ring-blue-200",
    step: 1,
    icon: Send,
    isFlowStatus: true,
  },
  dalam_review: {
    label: "Dalam Review",
    deskripsi: "Naskah sedang direview oleh editor",
    warnaBg: "bg-amber-100",
    warnaTeks: "text-amber-700",
    warnaRing: "ring-amber-200",
    step: 2,
    icon: Search,
    isFlowStatus: true,
  },
  dalam_editing: {
    label: "Dalam Editing",
    deskripsi: "Naskah dalam proses perbaikan dan editing",
    warnaBg: "bg-purple-100",
    warnaTeks: "text-purple-700",
    warnaRing: "ring-purple-200",
    step: 3,
    icon: Edit3,
    isFlowStatus: true,
  },
  siap_terbit: {
    label: "Siap Terbit",
    deskripsi: "Pengurusan ISBN dan dokumen kelengkapan",
    warnaBg: "bg-teal-100",
    warnaTeks: "text-teal-700",
    warnaRing: "ring-teal-200",
    step: 4,
    icon: FileCheck,
    isFlowStatus: true,
  },
  diterbitkan: {
    label: "Terbit",
    deskripsi: "Naskah sudah dipublikasikan",
    warnaBg: "bg-green-100",
    warnaTeks: "text-green-700",
    warnaRing: "ring-green-200",
    step: 5,
    icon: BookOpen,
    isFlowStatus: true,
  },
  ditolak: {
    label: "Perlu Revisi",
    deskripsi: "Naskah memerlukan revisi berdasarkan feedback editor",
    warnaBg: "bg-orange-100",
    warnaTeks: "text-orange-700",
    warnaRing: "ring-orange-200",
    step: 0,
    icon: XCircle,
    isFlowStatus: false,
  },
};

/**
 * Daftar tahap dalam flow penerbitan (untuk timeline/stepper)
 * Urutan sesuai proses: Submit → Review → Editing → Siap Terbit → Terbit
 */
export const TAHAP_PENERBITAN: StatusNaskah[] = [
  "diajukan",
  "dalam_review",
  "dalam_editing",
  "siap_terbit",
  "diterbitkan",
];

/**
 * Helper untuk mendapatkan konfigurasi status
 */
export function ambilKonfigurasiStatus(
  status: StatusNaskah,
): KonfigurasiStatus {
  return STATUS_NASKAH[status] || STATUS_NASKAH.draft;
}

/**
 * Helper untuk mengecek apakah status termasuk dalam flow penerbitan
 */
export function adalahStatusFlow(status: StatusNaskah): boolean {
  return STATUS_NASKAH[status]?.isFlowStatus ?? false;
}

/**
 * Helper untuk mendapatkan persentase progres
 */
export function hitungProgresStatus(status: StatusNaskah): number {
  const step = STATUS_NASKAH[status]?.step || 0;
  if (step === 0) return 0;
  return (step / 5) * 100;
}
