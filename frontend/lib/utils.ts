import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mendapatkan URL file yang benar dengan base URL backend
 * Menangani berbagai format URL: relatif, absolut, atau sudah lengkap
 * @param url - URL file (bisa relatif seperti /uploads/naskah/file.docx atau sudah lengkap)
 * @returns URL lengkap yang mengarah ke backend
 */
export function getFileUrl(url: string | undefined | null): string {
  if (!url) return "";

  // Jika sudah URL lengkap (http:// atau https://), kembalikan langsung
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Ambil base URL backend
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

  // Pastikan tidak ada double slash
  const cleanBackendUrl = backendUrl.replace(/\/+$/, "");
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;

  return `${cleanBackendUrl}${cleanUrl}`;
}

/**
 * Format angka ke format Rupiah Indonesia
 * @param nilai - Angka yang akan diformat
 * @returns String dalam format Rupiah (contoh: "Rp 150.000")
 */
export function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nilai);
}
