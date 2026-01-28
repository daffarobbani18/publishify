"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Search,
  User,
  Calendar,
  Tag,
  BookMarked,
  FileText,
  Loader2,
  Filter,
  Grid,
  List,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { naskahApi, type Naskah } from "@/lib/api/naskah";
import { kategoriApi, type Kategori } from "@/lib/api/kategori";
import { genreApi, type Genre } from "@/lib/api/genre";
import { getFileUrl } from "@/lib/utils";

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTanggal(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ============================================
// BOOK CARD COMPONENT
// ============================================

interface BookCardProps {
  buku: Naskah;
  viewMode: "grid" | "list";
}

function BookCard({ buku, viewMode }: BookCardProps) {
  const penulis =
    buku.penulis?.profilPengguna?.namaDepan ||
    buku.penulis?.email?.split("@")[0] ||
    "Anonim";

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex">
          {/* Cover Image */}
          <div className="relative w-32 h-44 flex-shrink-0 bg-gradient-to-br from-teal-400 to-teal-600">
            {buku.urlSampul ? (
              <Image
                src={getFileUrl(buku.urlSampul)}
                alt={buku.judul}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="w-12 h-12 text-white/50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900 line-clamp-1 hover:text-teal-600 transition-colors">
                  <Link href={`/katalog/${buku.id}`}>{buku.judul}</Link>
                </h3>
                {buku.subJudul && (
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {buku.subJudul}
                  </p>
                )}
              </div>
              {buku.isbn && (
                <Badge variant="outline" className="text-xs">
                  ISBN: {buku.isbn}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {penulis}
              </span>
              {buku.kategori && (
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {buku.kategori.nama}
                </span>
              )}
              {buku.genre && (
                <Badge variant="secondary" className="text-xs">
                  {buku.genre.nama}
                </Badge>
              )}
            </div>

            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {buku.sinopsis}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {buku.jumlahHalaman && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {buku.jumlahHalaman} halaman
                  </span>
                )}
                {buku.diterbitkanPada && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatTanggal(buku.diterbitkanPada)}
                  </span>
                )}
              </div>
              <Link href={`/katalog/${buku.id}`}>
                <Button variant="ghost" size="sm" className="text-teal-600">
                  Lihat Detail
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-teal-400 to-teal-600">
        {buku.urlSampul ? (
          <Image
            src={getFileUrl(buku.urlSampul)}
            alt={buku.judul}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-16 h-16 text-white/50" />
          </div>
        )}
        {buku.genre && (
          <Badge className="absolute top-2 right-2 bg-white/90 text-slate-700 text-xs">
            {buku.genre.nama}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-2 min-h-[48px] group-hover:text-teal-600 transition-colors">
          <Link href={`/katalog/${buku.id}`}>{buku.judul}</Link>
        </h3>

        <div className="flex items-center gap-1 mt-2 text-sm text-slate-600">
          <User className="w-4 h-4" />
          <span className="line-clamp-1">{penulis}</span>
        </div>

        {buku.kategori && (
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
            <Tag className="w-3 h-3" />
            <span>{buku.kategori.nama}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/katalog/${buku.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            Lihat Detail
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function KatalogBukuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("semua");
  const [selectedGenre, setSelectedGenre] = useState<string>("semua");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch buku yang sudah diterbitkan (endpoint publik)
  const { data: bukuResponse, isLoading: isLoadingBuku } = useQuery({
    queryKey: ["katalog-buku"],
    queryFn: async () => {
      const result = await naskahApi.ambilSemuaNaskah({
        status: "diterbitkan",
      });
      return result;
    },
  });

  // Fetch kategori
  const { data: kategoriResponse } = useQuery({
    queryKey: ["kategori-aktif"],
    queryFn: () => kategoriApi.ambilKategoriAktif(),
  });

  // Fetch genre
  const { data: genreResponse } = useQuery({
    queryKey: ["genre-aktif"],
    queryFn: () => genreApi.ambilGenreAktif(),
  });

  const bukuList = bukuResponse?.data || [];
  const kategoriList = kategoriResponse?.data || [];
  const genreList = genreResponse?.data || [];

  // Filter buku
  const filteredBuku = bukuList.filter((buku: Naskah) => {
    const matchSearch =
      buku.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (buku.subJudul?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ) ||
      (buku.sinopsis?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchKategori =
      selectedKategori === "semua" || buku.idKategori === selectedKategori;

    const matchGenre =
      selectedGenre === "semua" || buku.idGenre === selectedGenre;

    return matchSearch && matchKategori && matchGenre;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <BookMarked className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Katalog Buku</h1>
              <p className="text-teal-100">
                Jelajahi koleksi buku yang telah diterbitkan
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Cari judul, penulis, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-white text-slate-900 border-0 rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">Filter:</span>
            </div>

            <Select
              value={selectedKategori}
              onValueChange={setSelectedKategori}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kategori</SelectItem>
                {kategoriList.map((kategori: Kategori) => (
                  <SelectItem key={kategori.id} value={kategori.id}>
                    {kategori.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Genre</SelectItem>
                {genreList.map((genre: Genre) => (
                  <SelectItem key={genre.id} value={genre.id}>
                    {genre.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 mr-2">
              {filteredBuku.length} buku ditemukan
            </span>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingBuku && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <span className="ml-2 text-slate-600">Memuat katalog...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingBuku && filteredBuku.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              Tidak ada buku ditemukan
            </h3>
            <p className="text-slate-500">
              {searchQuery
                ? "Coba gunakan kata kunci lain"
                : "Belum ada buku yang diterbitkan"}
            </p>
          </div>
        )}

        {/* Book Grid/List */}
        {!isLoadingBuku && filteredBuku.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredBuku.map((buku: Naskah) => (
              <BookCard key={buku.id} buku={buku} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
