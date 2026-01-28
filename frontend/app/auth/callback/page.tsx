"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";

/**
 * OAuth Callback Page
 *
 * Halaman ini menerima redirect dari backend setelah user login via Google OAuth.
 * URL format: /auth/callback?token=xxx&refresh=xxx&success=true
 *
 * Flow:
 * 1. User klik "Continue with Google" di login/register page
 * 2. Redirect ke backend: GET /api/auth/google
 * 3. Backend redirect ke Google OAuth consent screen
 * 4. User approve & Google redirect ke backend callback
 * 5. Backend generate JWT tokens & redirect ke sini dengan tokens di query params
 * 6. Simpan tokens & redirect ke dashboard
 */
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    handleOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleOAuthCallback = async () => {
    try {
      // Extract params dari URL
      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refresh");
      const success = searchParams.get("success");
      const error = searchParams.get("error");
      const message = searchParams.get("message");

      // Jika ada error dari backend
      if (error) {
        setStatus("error");

        // Handle berbagai jenis error
        let userMessage =
          message || "Terjadi kesalahan saat login dengan Google";

        if (error === "oauth_not_configured") {
          userMessage =
            "Google OAuth belum dikonfigurasi pada server. Silakan gunakan login email/password.";
        } else if (error === "oauth_init_failed") {
          userMessage = "Gagal memulai proses OAuth. Silakan coba lagi.";
        } else if (error === "oauth_callback_failed") {
          userMessage = "Autentikasi Google gagal. Silakan coba lagi.";
        }

        setErrorMessage(userMessage);
        toast.error(userMessage);

        // Redirect ke login page setelah 3 detik
        setTimeout(() => {
          router.replace("/login");
        }, 3000);
        return;
      }

      // Jika tidak ada token, error
      if (!token || !refreshToken) {
        throw new Error("Token tidak ditemukan dalam response OAuth");
      }

      // Simpan tokens ke store (akan otomatis simpan ke localStorage juga)
      setTokens(token, refreshToken);

      // Set status sukses
      setStatus("success");
      toast.success("Login berhasil! Selamat datang di Publishify");

      // Decode token untuk ambil role
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      );
      const userRoles = payload.peran || [];

      // Redirect berdasarkan role (priority: admin > editor > penulis)
      setTimeout(() => {
        if (userRoles.includes("admin")) {
          router.replace("/admin");
        } else if (userRoles.includes("editor")) {
          router.replace("/editor");
        } else if (userRoles.includes("penulis")) {
          router.replace("/penulis");
        } else {
          // Fallback
          router.replace("/penulis");
        }
      }, 1000);
    } catch (err: any) {
      console.error("[OAuth Callback] Error:", err);
      setStatus("error");
      const errorMsg = err?.message || "Terjadi kesalahan saat memproses login";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);

      // Redirect ke login page setelah 3 detik
      setTimeout(() => {
        router.replace("/login");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center space-y-6">
        {/* Loading State */}
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-[#14b8a6] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Memproses Login...
            </h2>
            <p className="text-gray-600">
              Mohon tunggu, kami sedang memverifikasi akun Anda
            </p>
          </>
        )}

        {/* Success State */}
        {status === "success" && (
          <>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Login Berhasil!
            </h2>
            <p className="text-gray-600">Anda akan dialihkan ke dashboard...</p>
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Login Gagal</h2>
            <p className="text-gray-600">{errorMessage}</p>
            <p className="text-sm text-gray-500">
              Anda akan dialihkan ke halaman login...
            </p>
          </>
        )}

        {/* Manual redirect button (jika auto-redirect gagal) */}
        {status === "error" && (
          <button
            onClick={() => router.replace("/login")}
            className="w-full bg-[#14b8a6] text-white py-3 rounded-lg hover:bg-[#0d9488] transition-colors font-semibold"
          >
            Kembali ke Login
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-[#14b8a6] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Memuat...</h2>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
