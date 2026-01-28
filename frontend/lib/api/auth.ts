import api from "./client";

/**
 * Types untuk Authentication
 */
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
  profilPengguna?: {
    id: string;
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
  };
  // Backend mengirim 'peran' sebagai array string
  peran?: ("penulis" | "editor" | "admin")[];
  // Format lengkap (opsional untuk kompatibilitas)
  peranPengguna?: Array<{
    id: string;
    jenisPeran: "penulis" | "editor" | "admin";
    aktif: boolean;
  }>;
}

export interface RegisterDto {
  email: string;
  kataSandi: string;
  konfirmasiKataSandi: string;
  namaDepan: string;
  namaBelakang?: string;
  telepon?: string;
  jenisPeran: "penulis" | "editor";
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
}

export interface LoginDto {
  email: string;
  kataSandi: string;
}

export interface LoginResponse {
  sukses: boolean;
  pesan: string;
  data: {
    accessToken: string;
    refreshToken: string;
    pengguna: Pengguna;
  };
}

export interface RegisterResponse {
  sukses: boolean;
  pesan: string;
  data: {
    pengguna: Pengguna;
  };
}

export interface RefreshTokenResponse {
  sukses: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface VerifyEmailResponse {
  sukses: boolean;
  pesan: string;
  data: {
    pengguna: Pengguna;
  };
}

/**
 * Auth API Client
 */
export const authApi = {
  /**
   * Register pengguna baru
   */
  async register(data: RegisterDto): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>("/auth/daftar", data);
    return response.data;
  },

  /**
   * Login dengan email dan password
   */
  async login(data: LoginDto): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  /**
   * Logout (clear tokens di client-side)
   */
  async logout(): Promise<void> {
    // Backend tidak memerlukan logout endpoint karena stateless JWT
    // Hanya clear tokens di client-side
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  /**
   * Verify email dengan token
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const response = await api.get<VerifyEmailResponse>(
      `/auth/verify-email/${token}`,
    );
    return response.data;
  },

  /**
   * Request forgot password (kirim email reset)
   */
  async forgotPassword(
    email: string,
  ): Promise<{ sukses: boolean; pesan: string }> {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset password dengan token
   */
  async resetPassword(
    token: string,
    kataSandiBaru: string,
  ): Promise<{ sukses: boolean; pesan: string }> {
    const response = await api.post(`/auth/reset-password/${token}`, {
      kataSandiBaru,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<{ sukses: boolean; data: Pengguna }> {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  /**
   * Update password
   */
  async updatePassword(
    kataSandiLama: string,
    kataSandiBaru: string,
  ): Promise<{ sukses: boolean; pesan: string }> {
    const response = await api.put("/auth/update-password", {
      kataSandiLama,
      kataSandiBaru,
    });
    return response.data;
  },
};
