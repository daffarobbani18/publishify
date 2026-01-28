"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    kataSandi: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.kataSandi);

      // Get user data from store after login
      const pengguna = useAuthStore.getState().pengguna;
      const accessToken = useAuthStore.getState().accessToken;

      // Debug logging
      console.log("🔐 Login berhasil:", {
        email: pengguna?.email,
        peran: pengguna?.peran,
        tokenTersimpan: accessToken ? "✅ Ya" : "❌ Tidak",
        localStorageToken: localStorage.getItem("accessToken")
          ? "✅ Ya"
          : "❌ Tidak",
      });

      toast.success("Login berhasil. Selamat datang kembali!");

      // Tunggu sebentar untuk memastikan cookie tersimpan
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Redirect based on user role (priority: admin > editor > penulis)
      if (pengguna?.peran?.includes("admin")) {
        console.log("↪️ Redirect ke: /admin");
        router.push("/admin");
      } else if (pengguna?.peran?.includes("editor")) {
        console.log("↪️ Redirect ke: /editor");
        router.push("/editor");
      } else if (pengguna?.peran?.includes("penulis")) {
        console.log("↪️ Redirect ke: /penulis");
        router.push("/penulis");
      } else {
        // Fallback ke penulis jika tidak ada role
        console.log("↪️ Redirect fallback ke: /penulis");
        router.push("/penulis");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      toast.error(err?.message || "Email atau kata sandi salah");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect ke backend OAuth endpoint
    // Gunakan NEXT_PUBLIC_BACKEND_URL (tanpa /api) untuk menghindari double /api
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
    // Pastikan tidak ada double slash
    const cleanBackendUrl = backendUrl.replace(/\/+$/, "");
    const redirectUrl = `${cleanBackendUrl}/api/auth/google`;

    console.log("🔐 Google OAuth Redirect:", redirectUrl);
    window.location.href = redirectUrl;
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Side - Tagline */}
      <div className="text-left space-y-6 px-8">
        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Self-Publish
          <br />
          Your Ideas
          <br />
          Easily
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Masuk ke akun Publishify Anda dan lanjutkan perjalanan menulis Anda
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-6">
        {/* User Avatar Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-[#14b8a6] rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        {/* Create Account Button */}
        <Link
          href="/register"
          className="block w-full bg-[#14b8a6] text-white py-4 rounded-lg hover:bg-[#0d9488] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
        >
          Create Publishify Account
        </Link>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-lg hover:bg-gray-50 hover:border-[#14b8a6] transition-all duration-300 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">
              atau login dengan email
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-gray-300 pr-4">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v.01L12 12 2 6.01V6zm0 2.238V18a2 2 0 002 2h16a2 2 0 002-2V8.238l-9.553 5.506a2 2 0 01-1.894 0L2 8.238z" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full pl-16 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-gray-300 pr-4">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.kataSandi}
              onChange={(e) =>
                setFormData({ ...formData, kataSandi: e.target.value })
              }
              className="w-full pl-16 pr-14 py-4 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-start">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-600 hover:text-[#14b8a6] transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#0d7377] text-white py-4 rounded-lg hover:bg-[#0a5c5f] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-[#14b8a6] font-semibold hover:text-[#0d9488] transition-colors"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
