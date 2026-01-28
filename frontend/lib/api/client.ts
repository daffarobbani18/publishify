import axios, { AxiosInstance, AxiosError } from "axios";

/**
 * Base API URL dari environment variable
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Axios instance dengan konfigurasi default
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor untuk menambahkan token ke header
 */
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // DEBUG: Log token status
      if (
        process.env.NODE_ENV === "development" &&
        config.url?.includes("statistik")
      ) {
        console.log(`🔐 Auth Debug for ${config.url}:`, {
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 30)}...` : "null",
        });
      }
    }

    // Log request untuk debugging (hanya di development)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          params: config.params,
          data: config.data,
        },
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor untuk handle error dan refresh token
 */
api.interceptors.response.use(
  (response) => {
    // Log response untuk debugging (hanya di development)
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        },
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    // Log error untuk debugging (simplified)
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.status,
        error.response?.data || error.message,
      );

      // Special handling untuk Network Error
      if (error.message === "Network Error") {
        console.error("❌ BACKEND TIDAK DAPAT DIAKSES!");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("🔍 Kemungkinan penyebab:");
        console.error(
          "  1. Backend tidak running (jalankan: cd backend && npm run start:dev)",
        );
        console.error("  2. Backend crash atau error");
        console.error("  3. Port 4000 sudah digunakan aplikasi lain");
        console.error("  4. Firewall memblokir koneksi");
        console.error("");
        console.error("🛠️  Solusi:");
        console.error(
          "  1. Pastikan backend berjalan di http://localhost:4000",
        );
        console.error("  2. Cek terminal backend untuk error");
        console.error(
          "  3. Test dengan: curl http://localhost:4000/api/health",
        );
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      }
    }

    const originalRequest = error.config as any;

    // Jika error 401 dan belum retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Coba refresh token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;

          // Simpan token baru
          localStorage.setItem("accessToken", accessToken);

          // Retry request dengan token baru
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Jika refresh token gagal, redirect ke login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Standard response interface
 */
export interface Response<T = any> {
  sukses: boolean;
  pesan: string;
  data: T;
  metadata?: {
    total?: number;
    halaman?: number;
    limit?: number;
    totalHalaman?: number;
  };
}

/**
 * Helper function: Sanitize query params untuk memastikan tipe data yang benar
 * Prisma strict dengan tipe data, jadi halaman & limit harus number, bukan string
 */
export function sanitizeParams(
  params?: Record<string, any>,
): Record<string, any> {
  if (!params) return {};

  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    // Convert numeric fields to number
    if (
      key === "halaman" ||
      key === "limit" ||
      key === "page" ||
      key === "take" ||
      key === "skip"
    ) {
      cleaned[key] = Number(value);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export default api;
