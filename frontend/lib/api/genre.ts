/**
 * Genre API Client
 *
 * API untuk mengelola data genre buku
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

export interface Genre {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string;
  aktif: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
}

// ============================================
// API FUNCTIONS
// ============================================

export const genreApi = {
  /**
   * GET /genre - Ambil semua genre
   */
  async ambilSemuaGenre(): Promise<ResponseSukses<Genre[]>> {
    return api.get<ResponseSukses<Genre[]>>("/genre").then((res) => res.data);
  },

  /**
   * GET /genre/aktif - Ambil genre yang aktif saja
   */
  async ambilGenreAktif(): Promise<ResponseSukses<Genre[]>> {
    return api
      .get<ResponseSukses<Genre[]>>("/genre", { params: { aktif: true } })
      .then((res) => res.data);
  },

  /**
   * GET /genre/:id - Ambil detail genre
   */
  async ambilGenreById(id: string): Promise<ResponseSukses<Genre>> {
    return api
      .get<ResponseSukses<Genre>>(`/genre/${id}`)
      .then((res) => res.data);
  },

  /**
   * POST /genre - Buat genre baru (Admin only)
   */
  async buatGenre(
    data: Partial<Omit<Genre, "id" | "dibuatPada" | "diperbaruiPada">>,
  ): Promise<ResponseSukses<Genre>> {
    return api
      .post<ResponseSukses<Genre>>("/genre", data)
      .then((res) => res.data);
  },

  /**
   * PUT /genre/:id - Update genre (Admin only)
   */
  async perbaruiGenre(
    id: string,
    data: Partial<Omit<Genre, "id" | "dibuatPada" | "diperbaruiPada">>,
  ): Promise<ResponseSukses<Genre>> {
    return api
      .put<ResponseSukses<Genre>>(`/genre/${id}`, data)
      .then((res) => res.data);
  },

  /**
   * DELETE /genre/:id - Hapus genre (Admin only)
   */
  async hapusGenre(id: string): Promise<ResponseSukses<null>> {
    return api
      .delete<ResponseSukses<null>>(`/genre/${id}`)
      .then((res) => res.data);
  },
};
