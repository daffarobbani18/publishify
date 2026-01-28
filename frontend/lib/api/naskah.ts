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
  formatBuku?: "A4" | "A5" | "B5";
  bahasaTulis: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  status: string;
  urlSampul?: string;
  urlFile?: string;
  urlSuratPerjanjian?: string;
  urlSuratKeaslian?: string;
  urlProposalNaskah?: string;
  urlBuktiTransfer?: string;
  publik: boolean;
  biayaProduksi?: number | string;
  hargaJual?: number | string;
  diterbitkanPada?: string;
  dibuatPada: string;
  diperbaruiPada: string;
  // Relasi - opsional karena tergantung include query
  penulis?: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
      namaTampilan?: string;
      urlAvatar?: string;
      bio?: string;
    };
    profilPenulis?: {
      namaPena?: string;
    };
  };
  kategori?: Kategori;
  genre?: Genre;
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
  formatBuku?: "A4" | "A5" | "B5";
  bahasaTulis?: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  urlSampul?: string;
  urlFile?: string;
  // Konten HTML dari rich text editor (akan dikonversi ke DOCX di backend)
  konten?: string;
  // Fields for partial updates (kelengkapan)
  urlSuratPerjanjian?: string;
  urlSuratKeaslian?: string;
  urlProposalNaskah?: string;
  urlBuktiTransfer?: string;
  publik?: boolean;
  // ISBN diisi oleh penulis
  isbn?: string;
}

export interface FilterNaskahParams {
  halaman?: number;
  limit?: number;
  status?: string;
  cari?: string;
  idKategori?: string;
  idGenre?: string;
  publik?: boolean;
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
// TYPES UNTUK REVISI
// ============================================

export interface FeedbackReview {
  id: string;
  bab?: string;
  halaman?: number;
  komentar: string;
  dibuatPada: string;
}

export interface ReviewNaskahFeedback {
  id: string;
  status: string;
  rekomendasi: "setujui" | "revisi" | "tolak" | null;
  catatan?: string;
  ditugaskanPada: string;
  selesaiPada?: string;
  editor: {
    id: string;
    email: string;
    profilPengguna?: {
      namaTampilan?: string;
      urlAvatar?: string;
    };
  };
  feedback: FeedbackReview[];
}

export interface FeedbackData {
  naskah: {
    id: string;
    judul: string;
    status: string;
  };
  reviews: ReviewNaskahFeedback[];
  totalReview: number;
  reviewTerakhir: ReviewNaskahFeedback | null;
}

export interface SubmitRevisiPayload {
  konten?: string;
  urlFile?: string;
  catatan?: string;
}

// ============================================
// API CLIENT
// ============================================

export const naskahApi = {
  /**
   * POST /naskah - Buat naskah baru
   */
  async buatNaskah(
    payload: BuatNaskahPayload,
  ): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.post<ResponseSukses<Naskah>>("/naskah", payload);
    return data;
  },

  /**
   * GET /naskah - Ambil semua naskah dengan filter
   */
  async ambilSemuaNaskah(
    params?: FilterNaskahParams,
  ): Promise<ResponseSukses<Naskah[]>> {
    const { data } = await api.get<ResponseSukses<Naskah[]>>("/naskah", {
      params: sanitizeParams(params),
    });
    return data;
  },

  /**
   * GET /naskah/admin/semua - Ambil SEMUA naskah untuk admin (tanpa filter publik)
   * Role: admin only
   */
  async ambilSemuaNaskahAdmin(
    params?: FilterNaskahParams,
  ): Promise<ResponseSukses<Naskah[]>> {
    const { data } = await api.get<ResponseSukses<Naskah[]>>(
      "/naskah/admin/semua",
      {
        params: sanitizeParams(params),
      },
    );
    return data;
  },

  /**
   * GET /naskah/penulis/saya - Ambil naskah penulis yang sedang login
   */
  async ambilNaskahSaya(
    params?: FilterNaskahParams,
  ): Promise<ResponseSukses<Naskah[]>> {
    const { data } = await api.get<ResponseSukses<Naskah[]>>(
      "/naskah/penulis/saya",
      {
        params: sanitizeParams(params),
      },
    );
    return data;
  },

  /**
   * GET /naskah/penulis/diterbitkan - Ambil naskah yang sudah diterbitkan (siap cetak)
   * Filter: status = 'disetujui' & review.status = 'selesai' & review.rekomendasi = 'setujui'
   */
  async ambilNaskahDiterbitkan(): Promise<ResponseSukses<Naskah[]>> {
    const { data } = await api.get<ResponseSukses<Naskah[]>>(
      "/naskah/penulis/diterbitkan",
    );
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
   * PUT /naskah/:id - Perbarui naskah
   */
  async perbaruiNaskah(
    id: string,
    payload: Partial<BuatNaskahPayload>,
  ): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.put<ResponseSukses<Naskah>>(
      `/naskah/${id}`,
      payload,
    );
    return data;
  },

  /**
   * PUT /naskah/:id/ajukan - Ajukan naskah untuk review
   */
  async ajukanNaskah(
    id: string,
    catatan?: string,
  ): Promise<ResponseSukses<Naskah>> {
    const payload = catatan ? { catatan } : {};
    const { data } = await api.put<ResponseSukses<Naskah>>(
      `/naskah/${id}/ajukan`,
      payload,
    );
    return data;
  },

  /**
   * PUT /naskah/:id/terbitkan - Admin terbitkan naskah (dari siap_terbit ke diterbitkan)
   * Role: admin, editor
   * Field: isbn (required), formatBuku (optional), jumlahHalaman (optional)
   */
  async terbitkanNaskah(
    id: string,
    payload: {
      isbn: string;
      formatBuku?: "A4" | "A5" | "B5";
      jumlahHalaman?: number;
    },
  ): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.put<ResponseSukses<Naskah>>(
      `/naskah/${id}/terbitkan`,
      payload,
    );
    return data;
  },

  /**
   * PUT /naskah/:id/status - Ubah status naskah (admin)
   */
  async ubahStatus(
    id: string,
    status: string,
  ): Promise<ResponseSukses<Naskah>> {
    const { data } = await api.put<ResponseSukses<Naskah>>(
      `/naskah/${id}/status`,
      { status },
    );
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
    const { data } =
      await api.get<ResponseSukses<Kategori[]>>("/kategori/aktif");
    return data;
  },

  /**
   * GET /genre/aktif - Ambil daftar genre aktif (public endpoint, untuk dropdown)
   */
  async ambilGenre(): Promise<ResponseSukses<Genre[]>> {
    const { data } = await api.get<ResponseSukses<Genre[]>>("/genre/aktif");
    return data;
  },

  /**
   * GET /naskah/:id/feedback - Ambil feedback dari editor untuk naskah
   */
  async ambilFeedback(idNaskah: string): Promise<ResponseSukses<FeedbackData>> {
    const { data } = await api.get<ResponseSukses<FeedbackData>>(
      `/naskah/${idNaskah}/feedback`,
    );
    return data;
  },

  /**
   * POST /naskah/:id/submit-revisi - Submit revisi naskah
   */
  async submitRevisi(
    idNaskah: string,
    payload: SubmitRevisiPayload,
  ): Promise<ResponseSukses<{ naskah: Naskah; versiBaru: number }>> {
    const { data } = await api.post<
      ResponseSukses<{ naskah: Naskah; versiBaru: number }>
    >(`/naskah/${idNaskah}/submit-revisi`, payload);
    return data;
  },

  /**
   * POST /upload - Upload file naskah
   */
  async uploadFile(
    formData: FormData,
  ): Promise<ResponseSukses<{ url: string }>> {
    const { data } = await api.post<ResponseSukses<{ url: string }>>(
      "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },
};

/**
 * GET /naskah/:id - Ambil detail naskah by ID
 */
export async function ambilNaskahById(
  id: string,
): Promise<ResponseSukses<Naskah>> {
  const { data } = await api.get<ResponseSukses<Naskah>>(`/naskah/${id}`);
  return data;
}

/**
 * GET /naskah/penulis/saya - Ambil naskah milik penulis yang login
 */
export async function ambilNaskahPenulis(): Promise<ResponseSukses<Naskah[]>> {
  const { data } = await api.get<ResponseSukses<Naskah[]>>(
    "/naskah/penulis/saya",
  );
  return data;
}
