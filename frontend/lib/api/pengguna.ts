import api, { sanitizeParams } from "./client";

// ================================
// TYPES
// ================================

export type JenisPeran = "penulis" | "editor" | "admin";

export interface PeranPengguna {
  jenisPeran: JenisPeran;
  // Backend hanya return jenisPeran untuk list view (optimized)
  id?: string;
  idPengguna?: string;
  aktif?: boolean;
  ditugaskanPada?: string;
  ditugaskanOleh?: string;
}

export interface ProfilPengguna {
  id: string;
  idPengguna: string;
  namaDepan?: string;
  namaBelakang?: string;
  namaTampilan?: string;
  bio?: string;
  urlAvatar?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
}

export interface Pengguna {
  id: string;
  email: string;
  telepon?: string;
  aktif: boolean;
  terverifikasi: boolean;
  emailDiverifikasiPada?: string;
  loginTerakhir?: string;
  dibuatPada: string;
  diperbaruiPada: string;
  profilPengguna?: ProfilPengguna;
  peranPengguna?: PeranPengguna[];
}

export interface FilterPenggunaParams {
  halaman?: number;
  limit?: number;
  cari?: string;
  jenisPeran?: JenisPeran;
  aktif?: boolean;
}

export interface ResponseSukses<T> {
  sukses: true;
  pesan: string;
  data: T;
  metadata?: {
    total?: number;
    halaman?: number;
    limit?: number;
    totalHalaman?: number;
  };
}

// ================================
// API CLIENT
// ================================

export const penggunaApi = {
  /**
   * GET /pengguna - Ambil semua pengguna (admin only)
   */
  async ambilSemuaPengguna(
    params?: FilterPenggunaParams,
  ): Promise<ResponseSukses<Pengguna[]>> {
    const { data } = await api.get<ResponseSukses<Pengguna[]>>("/pengguna", {
      params: sanitizeParams(params),
    });
    return data;
  },

  /**
   * GET /pengguna/:id - Ambil detail pengguna by ID
   */
  async ambilPenggunaById(id: string): Promise<ResponseSukses<Pengguna>> {
    const { data } = await api.get<ResponseSukses<Pengguna>>(`/pengguna/${id}`);
    return data;
  },

  /**
   * PUT /pengguna/:id/status - Update status aktif pengguna
   */
  async updateStatusPengguna(
    id: string,
    aktif: boolean,
  ): Promise<ResponseSukses<Pengguna>> {
    const { data } = await api.put<ResponseSukses<Pengguna>>(
      `/pengguna/${id}/status`,
      { aktif },
    );
    return data;
  },

  /**
   * DELETE /pengguna/:id - Hapus pengguna (soft delete)
   */
  async hapusPengguna(id: string): Promise<ResponseSukses<void>> {
    const { data } = await api.delete<ResponseSukses<void>>(`/pengguna/${id}`);
    return data;
  },
};
