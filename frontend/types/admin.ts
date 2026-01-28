/**
 * Types untuk Admin Features
 * Termasuk terbitkan naskah, kelola pengguna, dll
 */

// Status Naskah - 5 Tahap Penerbitan
export type StatusNaskah =
  | "draft" // Draft awal
  | "diajukan" // 1. Submit
  | "dalam_review" // 2. Review
  | "dalam_editing" // 3. Editing
  | "siap_terbit" // 4. Siap Terbit
  | "diterbitkan" // 5. Terbit
  | "ditolak"; // Ditolak

// ============= NASKAH =============

export interface Naskah {
  id: string;
  idPenulis: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  isbn?: string;
  idKategori: string;
  idGenre: string;
  bahasaTulis: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  status: StatusNaskah;
  urlSampul?: string;
  urlFile?: string;
  publik: boolean;
  biayaProduksi?: number; // Biaya produksi yang ditetapkan admin
  hargaJual?: number; // Harga jual yang ditetapkan penulis
  diterbitkanPada?: string | Date;
  dibuatPada: string | Date;
  diperbaruiPada: string | Date;

  // Relations
  penulis?: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
      namaTampilan?: string;
    };
  };
  kategori?: {
    id: string;
    nama: string;
    slug: string;
  };
  genre?: {
    id: string;
    nama: string;
    slug: string;
  };
}

// ============= DTOs =============

/**
 * DTO untuk Admin terbitkan naskah
 */
export interface TerbitkanNaskahDto {
  isbn: string; // ISBN yang sudah diurus admin dari Perpusnas
  biayaProduksi: number; // Biaya produksi untuk cetak (Rp 30.000)
}

/**
 * DTO untuk Penulis atur harga jual
 */
export interface AturHargaJualDto {
  hargaJual: number; // Harga jual yang ditentukan penulis (Rp 50.000)
}

/**
 * Response detail naskah
 */
export interface ResponseNaskahDetail {
  sukses: boolean;
  pesan: string;
  data: Naskah;
}

/**
 * Response list naskah dengan pagination
 */
export interface ResponseNaskahList {
  sukses: boolean;
  data: Naskah[];
  metadata: {
    total: number;
    halaman: number;
    limit: number;
    totalHalaman: number;
  };
}

/**
 * Filter untuk list naskah
 */
export interface FilterNaskah {
  status?: StatusNaskah;
  cari?: string; // Search judul/penulis
  halaman?: number;
  limit?: number;
}

// ============= STATISTIK ADMIN =============

export interface StatistikAdmin {
  totalNaskah: number;
  totalPenulis: number;
  totalDiterbitkan: number;
  menungguPublish: number; // Naskah yang sudah disetujui tapi belum diterbitkan
  naskahBaru: number; // Naskah yang diajukan (butuh assign editor)
}
