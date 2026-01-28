/**
 * Halaman Daftar Naskah Diterbitkan
 * Menampilkan naskah dengan status 'diterbitkan' yang siap dicetak
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getSampulUrl } from "@/lib/utils/url";
import { naskahApi } from "@/lib/api/naskah";
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
} from "lucide-react";

interface Naskah {
  id: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  isbn?: string;
  jumlahHalaman?: number;
  jumlahKata?: number;
  urlSampul?: string;
  kategori?: { nama: string };
  genre?: { nama: string };
  dibuatPada: string;
}

export default function DaftarNaskahDiterbitkan() {
  const [naskah, setNaskah] = useState<Naskah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("");

  useEffect(() => {
    ambilNaskahDiterbitkan();
  }, []);

  async function ambilNaskahDiterbitkan() {
    try {
      const response = await naskahApi.ambilNaskahDiterbitkan();
      setNaskah(response.data);
    } catch (error) {
      console.error("Error mengambil naskah diterbitkan:", error);
      toast.error("Gagal mengambil daftar naskah");
    } finally {
      setLoading(false);
    }
  }

  const filteredNaskah = naskah.filter((n) => {
    const matchSearch = n.judul.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori
      ? n.kategori?.nama === filterKategori
      : true;
    return matchSearch && matchKategori;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat naskah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Naskah Diterbitkan</h1>
        <p className="text-gray-600 mt-1">
          Pilih naskah yang ingin Anda cetak menjadi buku fisik
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul naskah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
        >
          <option value="">Semua Kategori</option>
          <option value="Fiksi">Fiksi</option>
          <option value="Non-Fiksi">Non-Fiksi</option>
          <option value="Puisi">Puisi</option>
        </select>
      </div>

      {/* Naskah Grid */}
      {filteredNaskah.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Belum Ada Naskah Diterbitkan
          </h3>
          <p className="text-gray-600 mb-6">
            Naskah Anda perlu disetujui dan diterbitkan terlebih dahulu sebelum
            dapat dicetak
          </p>
          <Link
            href="/penulis/penulis/naskah"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Kelola Naskah
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNaskah.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group"
            >
              {/* Cover Image */}
              <div className="relative h-64 bg-gradient-to-br from-teal-100 to-cyan-100">
                {item.urlSampul ? (
                  <Image
                    src={getSampulUrl(item.urlSampul)}
                    alt={item.judul}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-16 h-16 text-teal-300" />
                  </div>
                )}
                {item.isbn && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                    ISBN: {item.isbn}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {item.judul}
                </h3>
                {item.subJudul && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                    {item.subJudul}
                  </p>
                )}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {item.sinopsis}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  {item.jumlahHalaman && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{item.jumlahHalaman} hal</span>
                    </div>
                  )}
                  {item.kategori && (
                    <span className="px-2 py-1 bg-gray-100 rounded-md">
                      {item.kategori.nama}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/penulis/penulis/naskah/${item.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                  >
                    <Eye className="w-4 h-4" />
                    Detail
                  </Link>
                  <Link
                    href={`/penulis/penulis/percetakan/buat?naskahId=${item.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    <Printer className="w-4 h-4" />
                    Cetak
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination (if needed) */}
      {filteredNaskah.length > 0 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              Sebelumnya
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Halaman 1 dari 1
            </span>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
