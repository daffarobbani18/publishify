"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api/client";
import { getFileUrl } from "@/lib/utils";

interface Naskah {
  id: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  isbn?: string;
  status: string;
  urlSampul?: string;
  urlFile?: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  bahasaTulis: string;
  dibuatPada: string;
  diperbaruiPada: string;
  penulis: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
      bio?: string;
      alamat?: string;
      kota?: string;
    };
    profilPenulis?: {
      namaPena?: string;
      biografi?: string;
      spesialisasi?: string[];
      totalBuku?: number;
    };
  };
  kategori?: {
    id: string;
    nama: string;
    deskripsi?: string;
  };
  genre?: {
    id: string;
    nama: string;
    deskripsi?: string;
  };
}

interface ResponseSukses<T> {
  sukses: boolean;
  pesan: string;
  data: T;
}

export default function DetailNaskahEditorPage() {
  const router = useRouter();
  const params = useParams();
  const idNaskah = params.id as string;

  const [loading, setLoading] = useState(true);
  const [naskah, setNaskah] = useState<Naskah | null>(null);

  useEffect(() => {
    if (idNaskah) {
      fetchNaskah();
    }
  }, [idNaskah]);

  const fetchNaskah = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ResponseSukses<Naskah>>(
        `/naskah/${idNaskah}`,
      );
      setNaskah(data.data);
    } catch (error: any) {
      console.error("Error fetching naskah:", error);
      toast.error("Gagal memuat detail naskah");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (iso: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="bg-white rounded-xl p-8 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!naskah) return null;

  const namaPenulis =
    naskah.penulis.profilPenulis?.namaPena ||
    `${naskah.penulis.profilPengguna?.namaDepan || ""} ${naskah.penulis.profilPengguna?.namaBelakang || ""}`.trim() ||
    naskah.penulis.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Detail Naskah</h1>
            <p className="text-sm text-gray-600 mt-1">
              Informasi lengkap naskah untuk review
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Naskah Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {naskah.urlSampul && (
                <div className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
                  <img
                    src={naskah.urlSampul}
                    alt={naskah.judul}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {naskah.judul}
                    </h2>
                    {naskah.subJudul && (
                      <p className="text-xl text-gray-600 mb-4">
                        {naskah.subJudul}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-sm font-medium whitespace-nowrap">
                    📋 Siap Review
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="font-medium">{namaPenulis}</span>
                  </span>
                  {naskah.kategori && (
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      {naskah.kategori.nama}
                    </span>
                  )}
                  {naskah.genre && (
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {naskah.genre.nama}
                    </span>
                  )}
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  {naskah.jumlahHalaman && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Halaman</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {naskah.jumlahHalaman}
                      </div>
                    </div>
                  )}
                  {naskah.jumlahKata && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Kata</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {naskah.jumlahKata.toLocaleString()}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Bahasa</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {naskah.bahasaTulis === "id"
                        ? "Indonesia"
                        : naskah.bahasaTulis}
                    </div>
                  </div>
                  {naskah.isbn && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">ISBN</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {naskah.isbn}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
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
                    Sinopsis
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {naskah.sinopsis}
                  </p>
                </div>

                {/* Action Button - Download Only */}
                {naskah.urlFile && (
                  <a
                    href={getFileUrl(naskah.urlFile)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-medium justify-center w-full shadow-lg hover:shadow-xl"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Unduh File Naskah
                  </a>
                )}

                {/* Info untuk Editor */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-blue-800">
                      <strong>Info:</strong> Untuk mengerjakan review naskah
                      ini, silakan tunggu penugasan dari admin. Review yang
                      ditugaskan akan muncul di menu{" "}
                      <strong>"Daftar Review"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kategori & Genre Detail */}
            {(naskah.kategori?.deskripsi || naskah.genre?.deskripsi) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Kategori & Genre
                </h3>
                <div className="space-y-4">
                  {naskah.kategori?.deskripsi && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Kategori: {naskah.kategori.nama}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {naskah.kategori.deskripsi}
                      </p>
                    </div>
                  )}
                  {naskah.genre?.deskripsi && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Genre: {naskah.genre.nama}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {naskah.genre.deskripsi}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profil Penulis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profil Penulis
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Nama</div>
                  <div className="font-semibold text-gray-900">
                    {namaPenulis}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Email</div>
                  <div className="text-sm text-gray-700">
                    {naskah.penulis.email}
                  </div>
                </div>

                {naskah.penulis.profilPenulis?.biografi && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Biografi</div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {naskah.penulis.profilPenulis.biografi}
                    </div>
                  </div>
                )}

                {naskah.penulis.profilPenulis?.spesialisasi &&
                  naskah.penulis.profilPenulis.spesialisasi.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">
                        Spesialisasi
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {naskah.penulis.profilPenulis.spesialisasi.map(
                          (spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200"
                            >
                              {spec}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {naskah.penulis.profilPenulis?.totalBuku !== undefined && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Buku</div>
                    <div className="text-sm font-medium text-gray-900">
                      {naskah.penulis.profilPenulis.totalBuku} buku
                    </div>
                  </div>
                )}

                {naskah.penulis.profilPengguna?.alamat && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Alamat</div>
                    <div className="text-sm text-gray-700">
                      {naskah.penulis.profilPengguna.alamat}
                      {naskah.penulis.profilPengguna.kota &&
                        `, ${naskah.penulis.profilPengguna.kota}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Timeline Naskah</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      Naskah Diajukan
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTanggal(naskah.dibuatPada)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Catatan
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed">
                Naskah ini telah diajukan dan menunggu untuk direview. Hubungi
                admin untuk mendapatkan penugasan review naskah ini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
