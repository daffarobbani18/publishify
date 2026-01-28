"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Login Info, 2: Profile Info, 3: Additional Info
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1 - Login Info
    email: "",
    kataSandi: "",
    konfirmasiKataSandi: "",
    telepon: "",
    jenisPeran: "penulis" as "penulis" | "editor",

    // Step 2 - Profile Info
    namaDepan: "",
    namaBelakang: "",
    namaTampilan: "",
    bio: "",
    tanggalLahir: "",
    jenisKelamin: "",

    // Step 3 - Address Info
    alamat: "",
    kota: "",
    provinsi: "",
    kodePos: "",
  });
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validasi kekuatan password berdasarkan requirement backend
  const passwordValidation = useMemo(() => {
    const password = formData.kataSandi;
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      isValid:
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /\d/.test(password),
    };
  }, [formData.kataSandi]);

  // Hitung strength level (0-4)
  const passwordStrength = useMemo(() => {
    const checks = [
      passwordValidation.minLength,
      passwordValidation.hasUpperCase,
      passwordValidation.hasLowerCase,
      passwordValidation.hasNumber,
    ];
    return checks.filter(Boolean).length;
  }, [passwordValidation]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-300";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Lemah";
    if (passwordStrength === 3) return "Sedang";
    return "Kuat";
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi password strength sebelum submit
    if (!passwordValidation.isValid) {
      toast.error("Kata sandi harus memenuhi semua persyaratan keamanan");
      return;
    }

    if (formData.kataSandi !== formData.konfirmasiKataSandi) {
      toast.error("Konfirmasi kata sandi tidak cocok");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        email: formData.email,
        kataSandi: formData.kataSandi,
        konfirmasiKataSandi: formData.konfirmasiKataSandi,
        namaDepan: formData.namaDepan,
        namaBelakang: formData.namaBelakang || undefined,
        telepon: formData.telepon || undefined,
        jenisPeran: formData.jenisPeran,
        alamat: formData.alamat || undefined,
        kota: formData.kota || undefined,
        provinsi: formData.provinsi || undefined,
        kodePos: formData.kodePos || undefined,
      });
      toast.success("Registrasi berhasil. Silakan login.");
      router.replace("/login");
    } catch (err: unknown) {
      // Ambil pesan error dari response backend
      const axiosError = err as {
        response?: { data?: { message?: string; pesan?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError?.response?.data?.message ||
        axiosError?.response?.data?.pesan ||
        axiosError?.message ||
        "Registrasi gagal. Coba lagi.";
      toast.error(errorMessage);
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
          Bergabung dengan Publishify dan mulai perjalanan Anda menjadi penulis
          profesional
        </p>

        {/* Progress Indicator */}
        <div className="space-y-3 pt-8">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1
                  ? "bg-[#14b8a6] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div
              className={`text-sm font-medium ${step >= 1 ? "text-[#14b8a6]" : "text-gray-500"}`}
            >
              Informasi Akun
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2
                  ? "bg-[#14b8a6] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
            <div
              className={`text-sm font-medium ${step >= 2 ? "text-[#14b8a6]" : "text-gray-500"}`}
            >
              Profil Pribadi
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 3
                  ? "bg-[#14b8a6] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
            <div
              className={`text-sm font-medium ${step >= 3 ? "text-[#14b8a6]" : "text-gray-500"}`}
            >
              Alamat Lengkap
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#14b8a6] rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Buat Akun Publishify
          </h2>
          <p className="text-gray-600">
            Langkah {step} dari 3 -{" "}
            {step === 1
              ? "Informasi Akun"
              : step === 2
                ? "Profil Pribadi"
                : "Alamat Lengkap"}
          </p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={step === 3 ? handleSubmit : handleNextStep}
          className="space-y-4"
        >
          {/* STEP 1: Account Information */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                  required
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telepon"
                  placeholder="08xxxxxxxxxx"
                  value={formData.telepon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                  required
                />
              </div>

              {/* Jenis Peran Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daftar Sebagai <span className="text-red-500">*</span>
                </label>
                <select
                  name="jenisPeran"
                  value={formData.jenisPeran}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700 bg-white"
                  required
                >
                  <option value="penulis">Penulis</option>
                  <option value="editor">Editor</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih peran yang sesuai dengan kebutuhan Anda
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="kataSandi"
                    placeholder="Minimal 8 karakter"
                    value={formData.kataSandi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                    required
                    minLength={8}
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

                {/* Password Strength Indicator */}
                {formData.kataSandi && (
                  <div className="mt-3 space-y-2">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength <= 2
                            ? "text-red-600"
                            : passwordStrength === 3
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="space-y-1 text-xs">
                      <div
                        className={`flex items-center gap-2 ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {passwordValidation.minLength ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        <span>Minimal 8 karakter</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {passwordValidation.hasUpperCase ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        <span>Mengandung huruf besar (A-Z)</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {passwordValidation.hasLowerCase ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        <span>Mengandung huruf kecil (a-z)</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordValidation.hasNumber ? "text-green-600" : "text-gray-500"}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          {passwordValidation.hasNumber ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                        <span>Mengandung angka (0-9)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="konfirmasiKataSandi"
                    placeholder="Ulangi password"
                    value={formData.konfirmasiKataSandi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
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
              </div>
            </div>
          )}

          {/* STEP 2: Profile Information */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              {/* First Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Depan
                  </label>
                  <input
                    type="text"
                    name="namaDepan"
                    placeholder="Nama depan"
                    value={formData.namaDepan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Belakang
                  </label>
                  <input
                    type="text"
                    name="namaBelakang"
                    placeholder="Nama belakang"
                    value={formData.namaBelakang}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                  />
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Tampilan
                </label>
                <input
                  type="text"
                  name="namaTampilan"
                  placeholder="Nama yang akan ditampilkan"
                  value={formData.namaTampilan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio / Tentang Saya
                </label>
                <textarea
                  name="bio"
                  placeholder="Ceritakan sedikit tentang diri Anda..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700 resize-none"
                />
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggalLahir"
                  value={formData.tanggalLahir}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <select
                  name="jenisKelamin"
                  value={formData.jenisKelamin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Address Information */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                <textarea
                  name="alamat"
                  placeholder="Jalan, nomor rumah, RT/RW, dll"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700 resize-none"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  name="kota"
                  placeholder="Contoh: Jakarta"
                  value={formData.kota}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi
                </label>
                <input
                  type="text"
                  name="provinsi"
                  placeholder="Contoh: DKI Jakarta"
                  value={formData.provinsi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Pos
                </label>
                <input
                  type="text"
                  name="kodePos"
                  placeholder="Contoh: 12345"
                  value={formData.kodePos}
                  onChange={handleInputChange}
                  maxLength={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#14b8a6] focus:outline-none transition-colors text-gray-700"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold"
              >
                Kembali
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-[#14b8a6] text-white py-3 rounded-lg hover:bg-[#0d9488] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {step === 3 ? (loading ? "Memproses..." : "Daftar") : "Lanjut"}
            </button>
          </div>
        </form>

        {/* Divider */}
        {step === 1 && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">atau</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 hover:border-[#14b8a6] transition-all duration-300 font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          </>
        )}

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-[#14b8a6] font-semibold hover:text-[#0d9488] transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
