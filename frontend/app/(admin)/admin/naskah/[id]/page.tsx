"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  User,
  Calendar,
  FileText,
  FileEdit,
  CheckCircle2,
  Clock,
  FilePlus,
  ImageIcon,
  ShieldAlert,
  Save,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusTracker } from "@/components/naskah/status-tracker";
import {
  STATUS_NASKAH,
  type StatusNaskah,
} from "@/lib/constants/status-naskah";
import { naskahApi, type Naskah } from "@/lib/api/naskah";
import { KelengkapanForm } from "@/components/naskah/kelengkapan-form";
import { TerbitkanModal } from "@/components/naskah/terbitkan-modal";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFileUrl } from "@/lib/utils";

export default function AdminDetailNaskahPage() {
  const params = useParams();
  const router = useRouter();
  const [naskah, setNaskah] = useState<Naskah | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchNaskah = async () => {
    if (!params.id || typeof params.id !== "string") {
      toast.error("ID naskah tidak valid");
      router.replace("/admin/naskah");
      return;
    }

    setLoading(true);
    try {
      const res = await naskahApi.ambilNaskahById(params.id);
      if (res.sukses && res.data) {
        setNaskah(res.data);
      } else {
        throw new Error("Data naskah tidak ditemukan");
      }
    } catch (e: any) {
      toast.error(e?.message || "Gagal memuat detail naskah");
      setTimeout(() => router.replace("/admin/naskah"), 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNaskah();
  }, [params.id]);

  const handleUbahStatus = async (statusBaru: string) => {
    if (!naskah) return;
    setUpdating(true);
    try {
      await naskahApi.ubahStatus(naskah.id, statusBaru);
      toast.success(
        `Status berhasil diubah menjadi ${STATUS_NASKAH[statusBaru as StatusNaskah]?.label || statusBaru}`,
      );
      fetchNaskah();
    } catch (e: any) {
      toast.error(e?.response?.data?.pesan || "Gagal mengubah status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusActions = () => {
    if (!naskah) return null;
    const s = naskah.status as StatusNaskah;

    return (
      <div className="flex flex-wrap gap-2 items-center">
        {s === "diajukan" && (
          <Button
            onClick={() => handleUbahStatus("dalam_review")}
            disabled={updating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Mulai Review
          </Button>
        )}

        {s === "dalam_review" && (
          <>
            <Button
              onClick={() => handleUbahStatus("dalam_editing")}
              disabled={updating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Lanjut ke Editing
            </Button>
            <Button
              onClick={() => handleUbahStatus("ditolak")}
              disabled={updating}
              variant="destructive"
            >
              Tolak Naskah
            </Button>
          </>
        )}

        {s === "dalam_editing" && (
          <Button
            onClick={() => handleUbahStatus("siap_terbit")}
            disabled={updating}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            Selesai Editing (Siap Terbit)
          </Button>
        )}

        {s === "siap_terbit" && naskah && (
          <TerbitkanModal
            naskah={naskah}
            onSuccess={fetchNaskah}
            disabled={updating}
          />
        )}

        {/* Generic Status Override */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-1">Override:</span>
          <Select
            disabled={updating}
            onValueChange={(val) => handleUbahStatus(val)}
            value={s}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_NASKAH).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Manajemen Naskah
            </h1>
            <p className="text-slate-500">Detail dan kontrol status naskah</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        ) : naskah ? (
          <>
            {/* Admin Controls */}
            <Card className="border-teal-200 bg-teal-50/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-teal-800">
                  <ShieldAlert className="w-5 h-5" />
                  Kontrol Admin
                </CardTitle>
                <CardDescription>
                  Ubah status naskah sesuai tahapan penerbitan.
                </CardDescription>
              </CardHeader>
              <CardContent>{getStatusActions()}</CardContent>
            </Card>

            {/* Status Tracker */}
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600" />
                  Timeline Progress
                </h3>
                <StatusTracker
                  statusSaatIni={naskah.status as StatusNaskah}
                  ukuran="sedang"
                  tampilkanLabel={true}
                  tampilkanDeskripsi={true}
                />
              </CardContent>
            </Card>

            {/* Kelengkapan Dokumen (Read Only) */}
            <KelengkapanForm
              naskah={naskah}
              onUpdate={fetchNaskah}
              readOnly={true}
            />

            {/* Detail Naskah */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  Informasi Naskah
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {naskah.judul}
                    </h2>
                    <p className="text-slate-500 italic mb-4">
                      {naskah.subJudul || "Tanpa Sub-judul"}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {naskah.kategori?.nama}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {naskah.genre?.nama}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          Penulis:{" "}
                          {naskah.penulis?.profilPengguna?.namaTampilan ||
                            naskah.penulis?.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Dibuat:{" "}
                          {format(new Date(naskah.dibuatPada), "d MMMM yyyy", {
                            locale: localeId,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileEdit className="w-4 h-4" />
                        <span>
                          Update:{" "}
                          {format(
                            new Date(naskah.diperbaruiPada),
                            "d MMMM yyyy",
                            { locale: localeId },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h3 className="font-semibold text-slate-800 mb-2">
                      Sinopsis
                    </h3>
                    <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                      {naskah.sinopsis}
                    </p>
                  </div>
                </div>

                {/* File Naskah */}
                {naskah.urlFile && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-4">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">
                        File Naskah Utama
                      </p>
                      <a
                        href={getFileUrl(naskah.urlFile)}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {naskah.urlFile.split("/").pop()}
                      </a>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() =>
                        window.open(getFileUrl(naskah.urlFile!), "_blank")
                      }
                    >
                      Unduh
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Naskah tidak ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
