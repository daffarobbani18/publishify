"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { naskahApi } from "@/lib/api/naskah";
import api from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  User,
  FileText,
  UserPlus,
  Clock,
  AlertCircle,
} from "lucide-react";

// ================================
// INTERFACES
// ================================

interface NaskahDiajukan {
  id: string;
  judul: string;
  subJudul?: string;
  sinopsis: string;
  status: string;
  dibuatPada: string;
  diperbaruiPada: string;
  penulis: {
    id: string;
    email: string;
    profilPengguna?: {
      namaDepan?: string;
      namaBelakang?: string;
    };
  };
  kategori?: {
    nama: string;
  };
  genre?: {
    nama: string;
  };
}

interface Editor {
  id: string;
  email: string;
  telepon?: string;
  aktif: boolean;
  terverifikasi: boolean;
  profilPengguna?: {
    namaDepan?: string;
    namaBelakang?: string;
    namaTampilan?: string;
    urlAvatar?: string;
  };
  peranPengguna: Array<{
    jenisPeran: "penulis" | "editor" | "admin";
  }>;
}

// ================================
// MAIN COMPONENT
// ================================

export default function AntrianReviewPage() {
  const router = useRouter();
  const [naskahList, setNaskahList] = useState<NaskahDiajukan[]>([]);
  const [editorList, setEditorList] = useState<Editor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNaskah, setSelectedNaskah] = useState<NaskahDiajukan | null>(
    null,
  );
  const [selectedEditor, setSelectedEditor] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [pencarian, setPencarian] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch naskah dengan status 'diajukan'
      const naskahResponse = await naskahApi.ambilSemuaNaskahAdmin({
        limit: 100,
      });

      const allNaskah = naskahResponse.data || [];
      const naskahDiajukan = allNaskah.filter(
        (n: any) => n.status === "diajukan",
      );

      console.log("📚 Total naskah diajukan:", naskahDiajukan.length);
      setNaskahList(naskahDiajukan as unknown as NaskahDiajukan[]);

      // Fetch daftar editor menggunakan filter peran
      const editorResponse = await api.get("/pengguna", {
        params: {
          limit: 100,
          peran: "editor", // Filter langsung dari backend berdasarkan tabel peran_pengguna
        },
      });

      const editors = editorResponse.data?.data || [];

      console.log("👤 Total editor tersedia:", editors.length);
      console.log("� Data editor:", editors);
      setEditorList(editors);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleTugaskanEditor = (naskah: NaskahDiajukan) => {
    setSelectedNaskah(naskah);
    setSelectedEditor("");
    setDialogOpen(true);
  };

  const handleSubmitTugasan = async () => {
    if (!selectedNaskah || !selectedEditor) {
      toast.error("Pilih editor terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      // Panggil API untuk tugaskan review
      await api.post("/review/tugaskan", {
        idNaskah: selectedNaskah.id,
        idEditor: selectedEditor,
        catatan: `Review ditugaskan oleh admin untuk naskah "${selectedNaskah.judul}"`,
      });

      toast.success(
        "Editor berhasil ditugaskan! Status naskah berubah menjadi 'Dalam Review'",
      );

      // Refresh data
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error tugaskan editor:", error);
      toast.error(
        error.response?.data?.pesan ||
          error.response?.data?.message ||
          "Gagal menugaskan editor",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    if (!tanggal) return "-";
    try {
      return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "-";
    }
  };

  const getNamaPenulis = (penulis: any) => {
    if (!penulis) return "Unknown";
    if (penulis.profilPengguna) {
      const { namaDepan, namaBelakang } = penulis.profilPengguna;
      return `${namaDepan || ""} ${namaBelakang || ""}`.trim() || penulis.email;
    }
    return penulis.email;
  };

  const getNamaEditor = (editor: Editor) => {
    if (editor.profilPengguna) {
      const { namaDepan, namaBelakang } = editor.profilPengguna;
      return `${namaDepan || ""} ${namaBelakang || ""}`.trim() || editor.email;
    }
    return editor.email;
  };

  // Filter berdasarkan pencarian
  const naskahTerfilter = naskahList.filter((naskah) => {
    if (!pencarian) return true;
    const query = pencarian.toLowerCase();
    const namaPenulis = getNamaPenulis(naskah.penulis).toLowerCase();
    return (
      naskah.judul?.toLowerCase().includes(query) ||
      naskah.sinopsis?.toLowerCase().includes(query) ||
      namaPenulis.includes(query) ||
      naskah.kategori?.nama?.toLowerCase().includes(query) ||
      naskah.genre?.nama?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen w-full bg-transparent overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Gradient Header */}
        <div className="relative w-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                Antrian Review
              </h1>
              <p className="text-sm sm:text-base text-teal-50">
                Naskah yang menunggu untuk ditugaskan ke editor
              </p>
            </div>
            <div className="flex-shrink-0 hidden lg:block">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Tentang Antrian Review</p>
              <p className="text-blue-700">
                Halaman ini menampilkan naskah dengan status{" "}
                <strong>"Diajukan"</strong>. Tugaskan editor untuk melakukan
                review, dan status akan otomatis berubah menjadi{" "}
                <strong>"Dalam Review"</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                  {naskahList.length}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">
                  Total Naskah Diajukan
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                  {editorList.length}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">
                  Editor Tersedia
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                  {naskahTerfilter.length}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-700">
                  Naskah Terfilter
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 p-4 shadow-sm">
          <input
            type="text"
            placeholder="🔍 Cari naskah (judul, penulis, kategori, genre)..."
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-slate-600">Memuat data...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && naskahTerfilter.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-100 rounded-full">
              <BookOpen className="w-12 h-12 text-slate-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Tidak Ada Naskah Diajukan
              </h3>
              <p className="text-slate-600">
                {pencarian
                  ? "Tidak ada naskah yang cocok dengan pencarian Anda"
                  : "Belum ada naskah yang menunggu review saat ini"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Naskah List */}
      {!loading && naskahTerfilter.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {naskahTerfilter.map((naskah) => (
            <div
              key={naskah.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-amber-500 p-4 sm:p-6"
            >
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0 w-full">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                        {naskah.judul}
                      </h3>
                      {naskah.subJudul && (
                        <p className="text-sm text-slate-600 mb-2">
                          {naskah.subJudul}
                        </p>
                      )}
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                        Menunggu Review
                      </Badge>
                    </div>
                  </div>

                  {/* Sinopsis */}
                  <p className="text-slate-700 mb-4 line-clamp-2">
                    {naskah.sinopsis}
                  </p>

                  {/* Meta Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium text-slate-700">
                        Penulis:
                      </span>
                      <span>{getNamaPenulis(naskah.penulis)}</span>
                    </div>

                    {naskah.kategori && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium text-slate-700">
                          Kategori:
                        </span>
                        <span>{naskah.kategori.nama}</span>
                      </div>
                    )}

                    {naskah.genre && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium text-slate-700">
                          Genre:
                        </span>
                        <span>{naskah.genre.nama}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium text-slate-700">
                        Diajukan:
                      </span>
                      <span>{formatTanggal(naskah.diperbaruiPada)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 w-full lg:w-auto">
                  <Button
                    onClick={() => handleTugaskanEditor(naskah)}
                    className="w-full lg:w-auto bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Tugaskan Editor
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Tugaskan Editor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tugaskan Editor untuk Review</DialogTitle>
            <DialogDescription>
              Pilih editor yang akan melakukan review naskah ini. Status naskah
              akan otomatis berubah menjadi "Dalam Review".
            </DialogDescription>
          </DialogHeader>

          {selectedNaskah && (
            <div className="space-y-4 py-4">
              {/* Info Naskah */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">
                  {selectedNaskah.judul}
                </h4>
                <p className="text-sm text-slate-600">
                  Penulis: {getNamaPenulis(selectedNaskah.penulis)}
                </p>
              </div>

              {/* Pilih Editor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Pilih Editor <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedEditor}
                  onValueChange={setSelectedEditor}
                >
                  <SelectTrigger className="w-full border-slate-300 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="-- Pilih Editor --" />
                  </SelectTrigger>
                  <SelectContent>
                    {editorList.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">
                        Tidak ada editor tersedia
                      </div>
                    ) : (
                      editorList.map((editor) => (
                        <SelectItem key={editor.id} value={editor.id}>
                          {getNamaEditor(editor)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-600">
                  Editor yang dipilih akan menerima tugas untuk mereview naskah
                  ini
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                  className="flex-1 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmitTugasan}
                  disabled={!selectedEditor || submitting}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
                >
                  {submitting ? "Memproses..." : "Tugaskan"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
