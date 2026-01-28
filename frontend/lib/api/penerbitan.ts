/**
 * API Client untuk modul Penerbitan
 * Mengelola operasi terkait paket penerbitan dan pesanan terbit
 */

import api from "./client";
import type {
  PaketPenerbitan,
  PesananTerbit,
  BuatPesananTerbitDto,
  SpesifikasiBukuDto,
  KelengkapanNaskahDto,
  UpdateStatusPesananDto,
  FilterPesananDto,
} from "@/types/penerbitan";

// ============================================
// PAKET PENERBITAN API
// ============================================

/**
 * Ambil daftar paket penerbitan yang tersedia
 */
export async function ambilSemuaPaket(termasukTidakAktif = false): Promise<{
  sukses: boolean;
  pesan: string;
  data: PaketPenerbitan[];
  total: number;
}> {
  const response = await api.get("/paket-penerbitan", {
    params: { termasukTidakAktif },
  });
  return response.data;
}

/**
 * Ambil detail paket penerbitan berdasarkan ID
 */
export async function ambilPaketById(id: string): Promise<{
  sukses: boolean;
  data: PaketPenerbitan;
}> {
  const response = await api.get(`/paket-penerbitan/${id}`);
  return response.data;
}

// ============================================
// PESANAN TERBIT API (PENULIS)
// ============================================

/**
 * Buat pesanan penerbitan baru
 */
export async function buatPesananTerbit(dto: BuatPesananTerbitDto): Promise<{
  sukses: boolean;
  pesan: string;
  data: PesananTerbit;
}> {
  const response = await api.post("/pesanan-terbit", dto);
  return response.data;
}

/**
 * Ambil daftar pesanan penulis
 */
export async function ambilPesananSaya(filter?: FilterPesananDto): Promise<{
  sukses: boolean;
  data: PesananTerbit[];
  metadata: {
    total: number;
    halaman: number;
    limit: number;
    totalHalaman: number;
  };
}> {
  const response = await api.get("/pesanan-terbit/saya", {
    params: filter,
  });
  return response.data;
}

/**
 * Ambil detail pesanan terbit
 */
export async function ambilDetailPesanan(id: string): Promise<{
  sukses: boolean;
  data: PesananTerbit;
}> {
  const response = await api.get(`/pesanan-terbit/${id}`);
  return response.data;
}

/**
 * Update spesifikasi buku
 */
export async function updateSpesifikasiBuku(
  idPesanan: string,
  dto: SpesifikasiBukuDto,
): Promise<{
  sukses: boolean;
  pesan: string;
  data: unknown;
}> {
  const response = await api.put(
    `/pesanan-terbit/${idPesanan}/spesifikasi`,
    dto,
  );
  return response.data;
}

/**
 * Update kelengkapan naskah
 */
export async function updateKelengkapanNaskah(
  idPesanan: string,
  dto: KelengkapanNaskahDto,
): Promise<{
  sukses: boolean;
  pesan: string;
  data: unknown;
}> {
  const response = await api.put(
    `/pesanan-terbit/${idPesanan}/kelengkapan`,
    dto,
  );
  return response.data;
}

/**
 * Upload bukti pembayaran (transfer)
 */
export async function uploadBuktiPembayaran(
  idPesanan: string,
  file: File,
): Promise<{
  sukses: boolean;
  pesan: string;
  data: PesananTerbit;
}> {
  const formData = new FormData();
  formData.append("buktiPembayaran", file);

  const response = await api.put(
    `/pesanan-terbit/${idPesanan}/bukti-pembayaran`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

// ============================================
// PESANAN TERBIT API (ADMIN/EDITOR)
// ============================================

/**
 * Ambil semua pesanan (admin/editor)
 */
export async function ambilSemuaPesanan(filter?: FilterPesananDto): Promise<{
  sukses: boolean;
  data: PesananTerbit[];
  metadata: {
    total: number;
    halaman: number;
    limit: number;
    totalHalaman: number;
  };
}> {
  const response = await api.get("/pesanan-terbit", {
    params: filter,
  });
  return response.data;
}

/**
 * Update status pesanan (admin/editor)
 */
export async function updateStatusPesanan(
  idPesanan: string,
  dto: UpdateStatusPesananDto,
): Promise<{
  sukses: boolean;
  pesan: string;
  data: PesananTerbit;
}> {
  const response = await api.put(`/pesanan-terbit/${idPesanan}/status`, dto);
  return response.data;
}

// ============================================
// EXPORT DEFAULT
// ============================================

const penerbitanApi = {
  // Paket
  ambilSemuaPaket,
  ambilPaketById,
  // Pesanan (penulis)
  buatPesananTerbit,
  ambilPesananSaya,
  ambilDetailPesanan,
  updateSpesifikasiBuku,
  updateKelengkapanNaskah,
  uploadBuktiPembayaran,
  // Pesanan (admin)
  ambilSemuaPesanan,
  updateStatusPesanan,
};

export default penerbitanApi;
