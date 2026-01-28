"use client";

import { use } from "react";
import { ExternalLink, Settings } from "lucide-react";

// Placeholder halaman detail buku terbit
export default function DetailBukuTerbitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Buku Terbit
            </h1>
            <p className="text-gray-600 mt-1">ID Buku: {id}</p>
          </div>
          <div className="flex gap-2">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4" /> Lihat Halaman Publik
            </a>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              <Settings className="w-4 h-4" /> Edit Metadata Terbatas
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <p className="text-gray-700">
            Ini adalah placeholder detail. Di sini nantinya akan ada:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2">
            <li>Info buku (judul, kategori/genre, tanggal terbit)</li>
            <li>Riwayat cetak (daftar pesanan cetak yang pernah dibuat)</li>
            <li>Tautan publik untuk dibagikan</li>
            <li>Form edit metadata terbatas (mis. deskripsi)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
