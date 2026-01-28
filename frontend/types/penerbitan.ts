/**
 * Types untuk modul Penerbitan
 * Alur: Pilih Paket → Kirim Naskah → Pemeriksaan → Proses Penerbitan → Distribusi
 */

// ============================================
// ENUMS
// ============================================

export type StatusPenerbitan =
  | "draft"
  | "menunggu_pembayaran"
  | "pembayaran_dikonfirmasi"
  | "naskah_dikirim"
  | "dalam_pemeriksaan"
  | "perlu_revisi"
  | "proses_editing"
  | "proses_layout"
  | "proses_isbn"
  | "siap_terbit"
  | "diterbitkan"
  | "dalam_distribusi";

export type StatusKelengkapan = "belum_diperiksa" | "lengkap" | "tidak_lengkap";

export type StatusPembayaranTerbit =
  | "belum_bayar"
  | "menunggu_konfirmasi"
  | "lunas"
  | "dibatalkan";

export type JenisSampul = "softcover" | "hardcover";

export type JenisKertas =
  | "hvs_70"
  | "hvs_80"
  | "bookpaper_55"
  | "bookpaper_70"
  | "artpaper_100"
  | "artpaper_120";

export type JenisJilid = "lem_panas" | "jahit_benang" | "spiral" | "ring";

// ============================================
// INTERFACES
// ============================================

export interface PaketPenerbitan {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  harga: number;
  jumlahBukuMin: number;
  termasukProofreading: boolean;
  termasukLayoutDesain: boolean;
  termasukISBN: boolean;
  termasukEbook: boolean;
  revisiMaksimal: number;
  fiturTambahan: string[];
  aktif: boolean;
  urutan: number;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface SpesifikasiBuku {
  id: string;
  idPesananTerbit: string;
  jenisSampul: JenisSampul;
  lapisSampul?: string;
  jenisKertas: JenisKertas;
  ukuranBuku: string;
  ukuranCustomPanjang?: number;
  ukuranCustomLebar?: number;
  jenisJilid: JenisJilid;
  laminasi?: string;
  pembatasBuku: boolean;
  packingKhusus: boolean;
  catatanTambahan?: string;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface KelengkapanNaskah {
  id: string;
  idPesananTerbit: string;
  adaKataPengantar: boolean;
  adaDaftarIsi: boolean;
  adaBabIsi: boolean;
  adaDaftarPustaka: boolean;
  adaTentangPenulis: boolean;
  adaSinopsis: boolean;
  adaLampiran: boolean;
  urlKataPengantar?: string;
  urlDaftarIsi?: string;
  urlDaftarPustaka?: string;
  urlTentangPenulis?: string;
  urlSinopsis?: string;
  urlLampiran?: string;
  catatanKelengkapan?: string;
  statusVerifikasi: StatusKelengkapan;
  diverifikasiOleh?: string;
  diverifikasiPada?: string;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface LogProsesTerbit {
  id: string;
  idPesananTerbit: string;
  statusSebelumnya?: string;
  statusBaru: string;
  catatan?: string;
  dibuatOleh?: string;
  dibuatPada: string;
}

export interface PesananTerbit {
  id: string;
  nomorPesanan: string;
  idPenulis: string;
  idNaskah: string;
  idPaket: string;
  status: StatusPenerbitan;
  jumlahBuku: number;
  statusEditing: string;
  statusLayout: string;
  statusProofreading: string;
  isbn?: string;
  statusISBN: string;
  totalHarga: number;
  statusPembayaran: StatusPembayaranTerbit;
  metodePembayaran?: string;
  buktiPembayaran?: string;
  jumlahRevisiDesain: number;
  jumlahRevisiLayout: number;
  revisiMaksimal: number;
  catatanPenulis?: string;
  catatanEditor?: string;
  catatanAdmin?: string;
  tanggalPesan: string;
  tanggalBayar?: string;
  tanggalMulaiProses?: string;
  tanggalSelesai?: string;
  diperbaruiPada: string;
  // Relations
  naskah?: {
    id: string;
    judul: string;
    subJudul?: string;
    sinopsis?: string;
    urlSampul?: string;
    urlFile?: string;
    jumlahHalaman?: number;
  };
  paket?: PaketPenerbitan;
  penulis?: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
    };
  };
  spesifikasi?: SpesifikasiBuku;
  kelengkapan?: KelengkapanNaskah;
  logProsesTerbit?: LogProsesTerbit[];
}

// ============================================
// DTOs
// ============================================

export interface BuatPesananTerbitDto {
  idNaskah: string;
  idPaket: string;
  jumlahBuku: number;
  catatanPenulis?: string;
}

export interface SpesifikasiBukuDto {
  jenisSampul?: JenisSampul;
  lapisSampul?: string;
  jenisKertas?: JenisKertas;
  ukuranBuku?: string;
  ukuranCustomPanjang?: number;
  ukuranCustomLebar?: number;
  jenisJilid?: JenisJilid;
  laminasi?: string;
  pembatasBuku?: boolean;
  packingKhusus?: boolean;
  catatanTambahan?: string;
}

export interface KelengkapanNaskahDto {
  adaKataPengantar?: boolean;
  adaDaftarIsi?: boolean;
  adaBabIsi?: boolean;
  adaDaftarPustaka?: boolean;
  adaTentangPenulis?: boolean;
  adaSinopsis?: boolean;
  adaLampiran?: boolean;
  urlKataPengantar?: string;
  urlDaftarIsi?: string;
  urlDaftarPustaka?: string;
  urlTentangPenulis?: string;
  urlSinopsis?: string;
  urlLampiran?: string;
  catatanKelengkapan?: string;
}

export interface UpdateStatusPesananDto {
  status: string;
  catatan?: string;
}

export interface FilterPesananDto {
  status?: string;
  statusPembayaran?: string;
  halaman?: number;
  limit?: number;
}

// ============================================
// LABEL MAPS
// ============================================

export const LABEL_STATUS_PENERBITAN: Record<StatusPenerbitan, string> = {
  draft: "Draft",
  menunggu_pembayaran: "Menunggu Pembayaran",
  pembayaran_dikonfirmasi: "Pembayaran Dikonfirmasi",
  naskah_dikirim: "Naskah Dikirim",
  dalam_pemeriksaan: "Dalam Pemeriksaan",
  perlu_revisi: "Perlu Revisi",
  proses_editing: "Proses Editing",
  proses_layout: "Proses Layout",
  proses_isbn: "Proses ISBN",
  siap_terbit: "Siap Terbit",
  diterbitkan: "Diterbitkan",
  dalam_distribusi: "Dalam Distribusi",
};

export const LABEL_STATUS_PEMBAYARAN: Record<StatusPembayaranTerbit, string> = {
  belum_bayar: "Belum Bayar",
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  lunas: "Lunas",
  dibatalkan: "Dibatalkan",
};

export const LABEL_JENIS_SAMPUL: Record<JenisSampul, string> = {
  softcover: "Softcover",
  hardcover: "Hardcover",
};

export const LABEL_JENIS_KERTAS: Record<JenisKertas, string> = {
  hvs_70: "HVS 70 gsm",
  hvs_80: "HVS 80 gsm",
  bookpaper_55: "Bookpaper 55 gsm",
  bookpaper_70: "Bookpaper 70 gsm",
  artpaper_100: "Artpaper 100 gsm",
  artpaper_120: "Artpaper 120 gsm",
};

export const LABEL_JENIS_JILID: Record<JenisJilid, string> = {
  lem_panas: "Lem Panas",
  jahit_benang: "Jahit Benang",
  spiral: "Spiral",
  ring: "Ring",
};

export const LABEL_STATUS_KELENGKAPAN: Record<StatusKelengkapan, string> = {
  belum_diperiksa: "Belum Diperiksa",
  lengkap: "Lengkap",
  tidak_lengkap: "Tidak Lengkap",
};

// ============================================
// TAHAPAN PENERBITAN (untuk progress stepper)
// ============================================

export const TAHAPAN_PENERBITAN = [
  {
    id: 1,
    nama: "Pilih Paket",
    deskripsi: "Pilih paket penerbitan sesuai kebutuhan",
    statusTerkait: ["draft", "menunggu_pembayaran"],
  },
  {
    id: 2,
    nama: "Kirim Naskah",
    deskripsi: "Kirim naskah dan lengkapi kelengkapan",
    statusTerkait: ["pembayaran_dikonfirmasi", "naskah_dikirim"],
  },
  {
    id: 3,
    nama: "Pemeriksaan",
    deskripsi: "Editor memeriksa kelengkapan naskah",
    statusTerkait: ["dalam_pemeriksaan", "perlu_revisi"],
  },
  {
    id: 4,
    nama: "Proses Penerbitan",
    deskripsi: "Editing, layout, dan pengurusan ISBN",
    statusTerkait: [
      "proses_editing",
      "proses_layout",
      "proses_isbn",
      "siap_terbit",
    ],
  },
  {
    id: 5,
    nama: "Distribusi",
    deskripsi: "Buku diterbitkan dan didistribusikan",
    statusTerkait: ["diterbitkan", "dalam_distribusi"],
  },
];

// Helper: Ambil tahapan aktif berdasarkan status
export function ambilTahapanAktif(status: StatusPenerbitan): number {
  const tahapan = TAHAPAN_PENERBITAN.find((t) =>
    t.statusTerkait.includes(status),
  );
  return tahapan?.id ?? 1;
}
