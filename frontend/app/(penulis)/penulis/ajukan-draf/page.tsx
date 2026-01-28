/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  Image as ImageIcon,
  BookOpen,
  Send,
  Calendar,
} from "lucide-react";
import { uploadApi } from "@/lib/api/upload";
import { naskahApi, type Kategori, type Genre } from "@/lib/api/naskah";

// Fungsi untuk mendapatkan sapaan berdasarkan waktu
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

type ModeInput = "tulis" | "upload";

export default function AjukanDrafPage() {
  const [modeInput, setModeInput] = useState<ModeInput>("tulis");
  const router = useRouter();
  const [formData, setFormData] = useState({
    judul: "",
    subJudul: "",
    sinopsis: "",
    idKategori: "",
    idGenre: "",
    formatBuku: "A5" as "A4" | "A5" | "B5",
    bahasaTulis: "id",
    kontenTeks: "",
  });

  // Daftar ukuran buku yang tersedia
  const formatBukuList = [
    {
      kode: "A4",
      nama: "A4 (21 × 29.7 cm)",
      deskripsi: "Ukuran besar, cocok untuk buku teks & katalog",
    },
    {
      kode: "A5",
      nama: "A5 (14.8 × 21 cm)",
      deskripsi: "Ukuran standar novel & buku populer",
    },
    {
      kode: "B5",
      nama: "B5 (17.6 × 25 cm)",
      deskripsi: "Ukuran sedang, cocok untuk majalah & jurnal",
    },
  ] as const;

  const [fileSampul, setFileSampul] = useState<File | null>(null);
  const [fileNaskah, setFileNaskah] = useState<File | null>(null);
  const [previewSampul, setPreviewSampul] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progressSampul, setProgressSampul] = useState(0);
  const [progressNaskah, setProgressNaskah] = useState(0);

  // State untuk kategori dan genre dari API
  const [kategoriList, setKategoriList] = useState<
    Array<Pick<Kategori, "id" | "nama">>
  >([]);
  const [genreList, setGenreList] = useState<Array<Pick<Genre, "id" | "nama">>>(
    [],
  );
  const [statusKategori, setStatusKategori] = useState<
    "idle" | "loading" | "sukses" | "gagal"
  >("idle");
  const [statusGenre, setStatusGenre] = useState<
    "idle" | "loading" | "sukses" | "gagal"
  >("idle");

  const bahasaList = [
    { kode: "id", nama: "Bahasa Indonesia" },
    { kode: "en", nama: "English" },
    { kode: "jv", nama: "Bahasa Jawa" },
    { kode: "su", nama: "Bahasa Sunda" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSampulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileSampul(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSampul(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNaskahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Accept Word documents (.doc, .docx) - manuscripts need to be editable
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
    ];

    if (file && allowedTypes.includes(file.type)) {
      setFileNaskah(file);
    } else {
      toast.error(
        "Hanya file Word (DOC/DOCX) yang diperbolehkan. Naskah harus dalam format yang dapat diedit.",
      );
    }
  };

  // Fetch kategori dan genre dari backend
  const fetchMeta = useCallback(async () => {
    setStatusKategori("loading");
    setStatusGenre("loading");
    try {
      const [katRes, genRes] = await Promise.all([
        naskahApi.ambilKategori().catch((err) => {
          console.error("Error fetching kategori:", err);
          return null;
        }),
        naskahApi.ambilGenre().catch((err) => {
          console.error("Error fetching genre:", err);
          return null;
        }),
      ]);

      console.log("Kategori Response:", katRes);
      console.log("Genre Response:", genRes);

      if (katRes?.data?.length) {
        setKategoriList(katRes.data.map((k) => ({ id: k.id, nama: k.nama })));
        setStatusKategori("sukses");
      } else {
        console.warn("Kategori data kosong atau tidak ada");
        setStatusKategori("gagal");
      }

      if (genRes?.data?.length) {
        setGenreList(genRes.data.map((g) => ({ id: g.id, nama: g.nama })));
        setStatusGenre("sukses");
      } else {
        console.warn("Genre data kosong atau tidak ada");
        setStatusGenre("gagal");
      }
    } catch (error) {
      console.error("Error fetching kategori/genre:", error);
      setStatusKategori("gagal");
      setStatusGenre("gagal");
    }
  }, []);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  const minimalKataSinopsisTerpenuhi = useMemo(() => {
    const kata = formData.sinopsis.trim().split(/\s+/).filter(Boolean).length;
    return kata >= 50;
  }, [formData.sinopsis]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validasi
    if (
      !formData.judul ||
      !formData.sinopsis ||
      !formData.idKategori ||
      !formData.idGenre
    ) {
      toast.error("Mohon lengkapi field yang wajib diisi");
      return;
    }

    if (!minimalKataSinopsisTerpenuhi) {
      toast.error("Sinopsis minimal 50 kata");
      return;
    }

    if (modeInput === "upload" && !fileNaskah) {
      toast.error("Mohon upload file naskah Word (DOC/DOCX)");
      return;
    }

    if (modeInput === "tulis" && !formData.kontenTeks) {
      toast.error("Mohon tulis konten naskah");
      return;
    }

    setLoading(true);
    setProgressSampul(0);
    setProgressNaskah(0);

    try {
      let urlSampul: string | undefined;
      let urlFile: string | undefined;

      // Upload sampul jika ada
      if (fileSampul) {
        console.log("🖼️ Mengupload sampul:", fileSampul.name);
        const res = await uploadApi.uploadFile(
          fileSampul,
          "sampul",
          "Sampul naskah",
          undefined,
          (p) => setProgressSampul(p),
        );
        urlSampul = res.urlPublik || res.url;
        console.log("✅ Upload sampul berhasil, urlSampul:", urlSampul);
      }

      // Siapkan file naskah
      // Variabel untuk menyimpan konten HTML jika mode tulis
      let kontenHtml: string | undefined;

      if (modeInput === "upload" && fileNaskah) {
        console.log("📁 Mengupload file Word:", fileNaskah.name);
        const res = await uploadApi.uploadFile(
          fileNaskah,
          "naskah",
          "File naskah (Word DOC/DOCX)",
          undefined,
          (p) => setProgressNaskah(p),
        );
        console.log("📦 Response upload:", res);
        urlFile = res.urlPublik || res.url;
        console.log("✅ Upload Word berhasil, urlFile:", urlFile);
      } else if (modeInput === "tulis") {
        // Mode ketik langsung: konversi plain text ke HTML sederhana
        // Backend akan mengkonversi HTML ini ke DOCX
        console.log("📝 Menyiapkan konten untuk konversi ke DOCX...");
        setProgressNaskah(50);

        // Konversi plain text ke HTML dengan paragraf
        const paragrafList = formData.kontenTeks
          .split(/\n\n+/)
          .filter((p) => p.trim());
        kontenHtml = paragrafList
          .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
          .join("");

        console.log(
          "✅ Konten HTML siap dikirim ke backend untuk konversi DOCX",
        );
        setProgressNaskah(100);
      }

      // Validasi UUID untuk idKategori & idGenre (hindari kirim dummy)
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRe.test(formData.idKategori) || !uuidRe.test(formData.idGenre)) {
        const metaSiap =
          statusKategori === "sukses" && statusGenre === "sukses";
        if (!metaSiap) {
          toast.error(
            "Gagal mengajukan: daftar kategori/genre belum dimuat dari server. Klik 'Muat Ulang Daftar' lalu pilih kategori & genre.",
          );
        } else {
          toast.error(
            "Kategori/Genre belum dipilih dengan benar. Silakan pilih ulang dari daftar.",
          );
        }
        setLoading(false);
        return;
      }

      const hitungJumlahKata = formData.kontenTeks
        ? formData.kontenTeks.trim().split(/\s+/).filter(Boolean).length
        : undefined;
      const jumlahKata =
        hitungJumlahKata && hitungJumlahKata >= 100
          ? hitungJumlahKata
          : undefined;

      // Konversi path relatif menjadi URL lengkap untuk validasi backend
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const urlFileAbsolut = urlFile ? `${backendUrl}${urlFile}` : undefined;
      const urlSampulAbsolut = urlSampul
        ? `${backendUrl}${urlSampul}`
        : undefined;

      console.log("📋 Menyimpan naskah dengan data:", {
        judul: formData.judul,
        formatBuku: formData.formatBuku,
        urlFile: urlFileAbsolut,
        urlSampul: urlSampulAbsolut,
        kontenHtml: kontenHtml ? "ada (akan dikonversi ke DOCX)" : "tidak ada",
        modeInput,
      });

      // LANGKAH 1: Buat naskah baru (status: DRAFT)
      // Jika mode tulis, kirim konten HTML untuk dikonversi ke DOCX oleh backend
      // Jika mode upload, kirim urlFile langsung
      const responseNaskah = await naskahApi.buatNaskah({
        judul: formData.judul,
        subJudul: formData.subJudul || undefined,
        sinopsis: formData.sinopsis,
        idKategori: formData.idKategori,
        idGenre: formData.idGenre,
        formatBuku: formData.formatBuku,
        bahasaTulis: formData.bahasaTulis,
        jumlahKata,
        urlSampul: urlSampulAbsolut,
        // Kirim urlFile jika mode upload, atau konten HTML jika mode tulis
        urlFile: urlFileAbsolut,
        konten: kontenHtml, // Backend akan konversi HTML ke DOCX
        publik: false,
      });

      console.log(
        "✅ Langkah 1: Naskah berhasil disimpan dengan status DRAFT:",
        responseNaskah.data,
      );
      const naskahId = responseNaskah.data.id;

      // VALIDASI: Pastikan naskah punya file sebelum diajukan
      // Jika mode tulis, backend sudah mengkonversi konten ke DOCX
      if (!urlFileAbsolut && !kontenHtml) {
        toast.error(
          "Naskah berhasil disimpan sebagai draft, tapi tidak bisa diajukan karena tidak ada file",
        );
        router.replace("/dashboard");
        return;
      }

      // LANGKAH 2: Ajukan naskah untuk review (status: DRAFT → IN_REVIEW)
      console.log("📤 Langkah 2: Mengajukan naskah untuk review...");
      await naskahApi.ajukanNaskah(
        naskahId,
        "Versi awal naskah diajukan untuk review",
      );

      console.log("✅ Langkah 2: Status berhasil diubah ke IN_REVIEW");
      toast.success(
        "Naskah berhasil dibuat dan diajukan untuk review! Admin akan menugaskan editor untuk mereview naskah Anda.",
      );

      router.replace("/dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.pesan || err?.message || "Gagal mengajukan naskah";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const hitungKata = (teks: string) => {
    return teks.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 overflow-hidden shadow-lg shadow-teal-500/20"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          {/* Content */}
          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2"
            >
              Ajukan Draf Baru
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm md:text-base text-white/90"
            >
              Buat dan ajukan naskah baru untuk proses review
            </motion.p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Mode Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm"
          >
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
              Pilih Mode Pengisian Naskah
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <motion.button
                type="button"
                onClick={() => setModeInput("tulis")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${
                  modeInput === "tulis"
                    ? "border-teal-500 bg-teal-50 shadow-md"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <FileText
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${
                      modeInput === "tulis" ? "text-teal-600" : "text-slate-400"
                    }`}
                  />
                  <div className="text-center">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">
                      Tulis Langsung
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Tulis naskah langsung di editor
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setModeInput("upload")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 sm:p-6 rounded-lg border-2 transition-all ${
                  modeInput === "upload"
                    ? "border-teal-500 bg-teal-50 shadow-md"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <Upload
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${
                      modeInput === "upload"
                        ? "text-teal-600"
                        : "text-slate-400"
                    }`}
                  />
                  <div className="text-center">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">
                      Upload File Word
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Upload naskah dalam format Word (DOC/DOCX)
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Informasi Dasar Naskah */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Informasi Dasar Naskah
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom Kiri - Form Fields */}
              <div className="lg:col-span-2 space-y-4">
                {/* Judul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Naskah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="judul"
                    value={formData.judul}
                    onChange={handleInputChange}
                    placeholder="Masukkan judul naskah"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                    required
                  />
                </div>

                {/* Sub Judul */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Judul (Opsional)
                  </label>
                  <input
                    type="text"
                    name="subJudul"
                    value={formData.subJudul}
                    onChange={handleInputChange}
                    placeholder="Masukkan sub judul naskah"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                  />
                </div>

                {/* Kategori & Genre */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idKategori"
                      value={formData.idKategori}
                      onChange={handleInputChange}
                      disabled={statusKategori === "loading"}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        statusKategori === "loading"
                          ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">
                        {statusKategori === "loading"
                          ? "Memuat kategori..."
                          : "Pilih Kategori"}
                      </option>
                      {kategoriList.map((kat) => (
                        <option key={kat.id} value={kat.id}>
                          {kat.nama}
                        </option>
                      ))}
                    </select>
                    {statusKategori === "gagal" && (
                      <div className="mt-1 text-xs text-red-600">
                        Gagal memuat kategori dari server.
                        <button
                          type="button"
                          onClick={fetchMeta}
                          className="ml-2 underline text-[#0d9488] hover:text-[#14b8a6]"
                        >
                          Muat Ulang Daftar
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="idGenre"
                      value={formData.idGenre}
                      onChange={handleInputChange}
                      disabled={statusGenre === "loading"}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent ${
                        statusGenre === "loading"
                          ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">
                        {statusGenre === "loading"
                          ? "Memuat genre..."
                          : "Pilih Genre"}
                      </option>
                      {genreList.map((gen) => (
                        <option key={gen.id} value={gen.id}>
                          {gen.nama}
                        </option>
                      ))}
                    </select>
                    {statusGenre === "gagal" && (
                      <div className="mt-1 text-xs text-red-600">
                        Gagal memuat genre dari server.
                        <button
                          type="button"
                          onClick={fetchMeta}
                          className="ml-2 underline text-[#0d9488] hover:text-[#14b8a6]"
                        >
                          Muat Ulang Daftar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bahasa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bahasa Naskah
                  </label>
                  <select
                    name="bahasaTulis"
                    value={formData.bahasaTulis}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent"
                  >
                    {bahasaList.map((bahasa) => (
                      <option key={bahasa.kode} value={bahasa.kode}>
                        {bahasa.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ukuran Buku */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ukuran Buku <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {formatBukuList.map((format) => (
                      <button
                        key={format.kode}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            formatBuku: format.kode,
                          }))
                        }
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          formData.formatBuku === format.kode
                            ? "border-[#14b8a6] bg-[#14b8a6]/5 shadow-md ring-2 ring-[#14b8a6]/20"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {/* Checkmark indicator */}
                        {formData.formatBuku === format.kode && (
                          <div className="absolute top-2 right-2">
                            <svg
                              className="w-5 h-5 text-[#14b8a6]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        {/* Book icon */}
                        <div
                          className={`w-10 h-12 mx-auto mb-2 rounded border-2 flex items-center justify-center ${
                            formData.formatBuku === format.kode
                              ? "border-[#14b8a6] bg-[#14b8a6]/10"
                              : "border-gray-300 bg-gray-100"
                          }`}
                        >
                          <span
                            className={`text-xs font-bold ${
                              formData.formatBuku === format.kode
                                ? "text-[#14b8a6]"
                                : "text-gray-500"
                            }`}
                          >
                            {format.kode}
                          </span>
                        </div>
                        <div className="text-center">
                          <p
                            className={`font-semibold text-sm ${
                              formData.formatBuku === format.kode
                                ? "text-[#14b8a6]"
                                : "text-gray-900"
                            }`}
                          >
                            {format.nama.split(" ")[0]}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {format.nama.match(/\(([^)]+)\)/)?.[1]}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="font-medium">Tips:</span>{" "}
                    {
                      formatBukuList.find((f) => f.kode === formData.formatBuku)
                        ?.deskripsi
                    }
                  </p>
                </div>

                {/* Sinopsis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sinopsis <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="sinopsis"
                    value={formData.sinopsis}
                    onChange={handleInputChange}
                    placeholder="Tulis sinopsis atau ringkasan naskah (minimal 50 kata)"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {hitungKata(formData.sinopsis)} kata
                  </p>
                </div>
              </div>

              {/* Kolom Kanan - Upload Sampul */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover/Sampul Buku
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#14b8a6] transition-colors">
                  {previewSampul ? (
                    <div className="relative">
                      <Image
                        src={previewSampul}
                        alt="Preview Sampul"
                        width={200}
                        height={300}
                        className="mx-auto rounded-lg shadow-md mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFileSampul(null);
                          setPreviewSampul("");
                        }}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 mb-2">
                        Klik untuk upload cover
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG (Max. 2MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSampulChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {fileSampul && progressSampul > 0 && progressSampul < 100 && (
                  <div className="mt-2 text-xs text-gray-600">
                    Upload sampul: {progressSampul}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi Buku */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Deskripsi Buku
            </h2>

            {modeInput === "tulis" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tulis Naskah <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="kontenTeks"
                  value={formData.kontenTeks}
                  onChange={handleInputChange}
                  placeholder="Mulai menulis naskah Anda di sini..."
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent resize-none font-serif text-base leading-relaxed"
                  required
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>{hitungKata(formData.kontenTeks)} kata</span>
                  <span>{formData.kontenTeks.length} karakter</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File Naskah (Word){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#14b8a6] transition-colors">
                  {fileNaskah ? (
                    <div className="space-y-4">
                      <svg
                        className="w-16 h-16 text-[#14b8a6] mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">
                          {fileNaskah.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(fileNaskah.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFileNaskah(null)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Hapus File
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 mb-2">
                        Klik untuk upload file Word (DOC/DOCX)
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        DOC, DOCX (Max. 50MB)
                      </p>
                      <input
                        type="file"
                        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleNaskahChange}
                        className="hidden"
                      />
                      <span className="inline-block px-6 py-2 bg-[#14b8a6] text-white rounded-lg hover:bg-[#0d9488] transition-colors">
                        Pilih File
                      </span>
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Upload naskah dalam format Word agar dapat diedit oleh
                  editor. File akan dikonversi dan disimpan dengan aman di
                  server.
                </p>
                {fileNaskah && progressNaskah > 0 && progressNaskah < 100 && (
                  <div className="mt-2 text-xs text-gray-600">
                    Upload naskah: {progressNaskah}%
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white hover:from-[#0d9488] hover:to-[#0a7a73]"
              }`}
            >
              {loading ? "Mengirim..." : "Ajukan untuk Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
