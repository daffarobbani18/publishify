/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Kategori API Client
 *
 * API untuk mengelola data kategori buku
 */

import api from "./client";

// ============================================
// RESPONSE TYPES
// ============================================

interface ResponseSukses<T> {
  sukses: true;
  pesan: string;
  data: T;
}

// ============================================
// TYPES
// ============================================

export interface Kategori {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string;
  idInduk?: string;
  aktif: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
  induk?: Kategori;
  subKategori?: Kategori[];
}

// ============================================
// API FUNCTIONS
// ============================================

export const kategoriApi = {
  /**
   * GET /kategori - Ambil semua kategori
   */
  async ambilSemuaKategori(): Promise<ResponseSukses<Kategori[]>> {
    return api
      .get<ResponseSukses<Kategori[]>>("/kategori")
      .then((res: { data: any }) => res.data);
  },

  /**
   * GET /kategori/aktif - Ambil kategori yang aktif saja
   */
  async ambilKategoriAktif(): Promise<ResponseSukses<Kategori[]>> {
    return api
      .get<ResponseSukses<Kategori[]>>("/kategori", { params: { aktif: true } })
      .then((res: { data: any }) => res.data);
  },

  /**
   * GET /kategori/:id - Ambil detail kategori
   */
  async ambilKategoriById(id: string): Promise<ResponseSukses<Kategori>> {
    return api
      .get<ResponseSukses<Kategori>>(`/kategori/${id}`)
      .then((res: { data: any }) => res.data);
  },

  /**
   * POST /kategori - Buat kategori baru (Admin only)
   */
  async buatKategori(
    data: Partial<Omit<Kategori, "id" | "dibuatPada" | "diperbaruiPada">>,
  ): Promise<ResponseSukses<Kategori>> {
    return api
      .post<ResponseSukses<Kategori>>("/kategori", data)
      .then((res: { data: any }) => res.data);
  },

  /**
   * PUT /kategori/:id - Update kategori (Admin only)
   */
  async perbaruiKategori(
    id: string,
    data: Partial<Omit<Kategori, "id" | "dibuatPada" | "diperbaruiPada">>,
  ): Promise<ResponseSukses<Kategori>> {
    return api
      .put<ResponseSukses<Kategori>>(`/kategori/${id}`, data)
      .then((res: { data: any }) => res.data);
  },

  /**
   * DELETE /kategori/:id - Hapus kategori (Admin only)
   */
  async hapusKategori(id: string): Promise<ResponseSukses<null>> {
    return api
      .delete<ResponseSukses<null>>(`/kategori/${id}`)
      .then((res: { data: any }) => res.data);
  },
};
