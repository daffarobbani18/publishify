import api, { sanitizeParams } from "./client";

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
}

export interface Genre {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string;
  aktif: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
}

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
  status: string;
  urlSampul?: string;
  urlFile?: string;
  publik: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
  review?: Array<{
    id: string;
    status: string;
    rekomendasi?: "setujui" | "revisi" | "tolak";
    catatan?: string;
    ditugaskanPada: string;
    selesaiPada?: string;
  }>;
}

export interface BuatNaskahPayload {
  judul: string;
  subJudul?: string;
  sinopsis: string;
  idKategori: string;
  idGenre: string;
  bahasaTulis?: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  urlSampul?: string;
  urlFile?: string;
  publik?: boolean;
}

export interface FilterNaskahParams {
  halaman?: number;
  limit?: number;
  status?: string;
  cari?: string;
  idKategori?: string;
  idGenre?: string;
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

// ============================================
// API CLIENT
// ============================================

export const naskahApi = {
  /**
   * POST /naskah - Buat naskah baru
   */
  async buatNaskah(payload: BuatNaskahPayload): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.post<ResponseSukses<Naskah>>("/naskah", payload);
    return data;
  },

  /**
   * GET /naskah - Ambil semua naskah dengan filter
   */
  async ambilSemuaNaskah(params?: FilterNaskahParams): Promise<ResponseSukses<Naskah[]>> {
    const { data } = await api.get<ResponseSukses<Naskah[]>>("/naskah", { 
      params: sanitizeParams(params) 
    });
    return data;
  },

  /**
   * GET /naskah/admin/semua - Ambil SEMUA naskah untuk admin (tanpa filter publik)
   * Role: admin only
   */
  async ambilSemuaNaskahAdmin(params?: FilterNaskahParams): Promise<ResponseSukses<Naskah[]>> {
    const { data } = await api.get<ResponseSukses<Naskah[]>>("/naskah/admin/semua", { 
      params: sanitizeParams(params) 
    });
    return data;
  },

  /**
   * GET /naskah/penulis/saya - Ambil naskah penulis yang sedang login
   */
  async ambilNaskahSaya(params?: FilterNaskahParams): Promise<ResponseSukses<Naskah[]>> {
    const { data } = await api.get<ResponseSukses<Naskah[]>>("/naskah/penulis/saya", { 
      params: sanitizeParams(params) 
    });
    return data;
  },

  /**
   * GET /naskah/:id - Ambil detail naskah by ID
   */
  async ambilNaskahById(id: string): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.get<ResponseSukses<Naskah>>(`/naskah/${id}`);
    return data;
  },

  /**
   * GET /naskah/admin/:id - Ambil detail naskah by ID untuk admin (bypass validasi akses)
   * Role: admin only
   */
  async ambilNaskahByIdAdmin(id: string): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.get<ResponseSukses<Naskah>>(`/naskah/admin/${id}`);
    return data;
  },

  /**
   * PUT /naskah/:id - Perbarui naskah
   */
  async perbaruiNaskah(id: string, payload: Partial<BuatNaskahPayload>): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.put<ResponseSukses<Naskah>>(`/naskah/${id}`, payload);
    return data;
  },

  /**
   * PUT /naskah/:id/ajukan - Ajukan naskah untuk review
   */
  async ajukanNaskah(id: string, catatan?: string): Promise<ResponseSukses<Naskah>> {
    const payload = catatan ? { catatan } : {};
    const { data } = await api.put<ResponseSukses<Naskah>>(`/naskah/${id}/ajukan`, payload);
    return data;
  },

  /**
   * DELETE /naskah/:id - Hapus naskah
   */
  async hapusNaskah(id: string): Promise<ResponseSukses<void>> {
    const { data } = await api.delete<ResponseSukses<void>>(`/naskah/${id}`);
    return data;
  },

  /**
   * GET /naskah/statistik - Ambil statistik naskah
   */
  async ambilStatistik(): Promise<ResponseSukses<any>> {
    const { data } = await api.get<ResponseSukses<any>>("/naskah/statistik");
    return data;
  },

  /**
   * GET /kategori/aktif - Ambil daftar kategori aktif (public endpoint, untuk dropdown)
   */
  async ambilKategori(): Promise<ResponseSukses<Kategori[]>> {
    const { data } = await api.get<ResponseSukses<Kategori[]>>("/kategori/aktif");
    return data;
  },

  /**
   * GET /genre/aktif - Ambil daftar genre aktif (public endpoint, untuk dropdown)
   */
  async ambilGenre(): Promise<ResponseSukses<Genre[]>> {
    const { data } = await api.get<ResponseSukses<Genre[]>>("/genre/aktif");
    return data;
  },
};
