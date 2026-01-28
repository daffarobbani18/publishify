"use client";

import { useState } from "react";
import { Book, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { naskahApi, type Naskah } from "@/lib/api/naskah";

interface TerbitkanModalProps {
  naskah: Naskah;
  onSuccess: () => void;
  disabled?: boolean;
}

/**
 * Modal untuk menerbitkan naskah (Admin)
 * ISBN sudah diisi oleh penulis, admin hanya melakukan konfirmasi final
 */
export function TerbitkanModal({
  naskah,
  onSuccess,
  disabled,
}: TerbitkanModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validasi kelengkapan dokumen
  const dokumenLengkap = Boolean(
    naskah.urlSuratPerjanjian &&
    naskah.urlSuratKeaslian &&
    naskah.urlProposalNaskah &&
    naskah.urlBuktiTransfer,
  );

  // ISBN harus sudah diisi oleh penulis
  const isbnTersedia = Boolean(naskah.isbn);

  // Semua syarat terpenuhi
  const siapTerbit = dokumenLengkap && isbnTersedia;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await naskahApi.terbitkanNaskah(naskah.id, {
        isbn: naskah.isbn || "",
      });
      toast.success("🎉 Naskah berhasil diterbitkan!");
      setOpen(false);
      onSuccess();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { pesan?: string } } };
      const pesan = error?.response?.data?.pesan || "Gagal menerbitkan naskah";
      toast.error(pesan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        disabled={disabled || !siapTerbit}
        className="bg-purple-600 hover:bg-purple-700 text-white"
        onClick={() => setOpen(true)}
      >
        <Book className="w-4 h-4 mr-2" />
        Terbitkan Naskah
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Book className="w-5 h-5 text-purple-600" />
              Konfirmasi Penerbitan
            </DialogTitle>
            <DialogDescription>
              Pastikan semua data sudah benar sebelum menerbitkan naskah.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Info Naskah */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Judul:</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px] truncate">
                  {naskah.judul}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penulis:</span>
                <span className="font-medium text-slate-800">
                  {naskah.penulis?.profilPengguna?.namaTampilan ||
                    naskah.penulis?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kategori:</span>
                <span className="font-medium text-slate-800">
                  {naskah.kategori?.nama}
                </span>
              </div>
            </div>

            {/* ISBN dari Penulis */}
            <div
              className={`p-4 rounded-lg border ${isbnTersedia ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isbnTersedia ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-medium">ISBN</span>
              </div>
              {isbnTersedia ? (
                <p className="font-mono text-lg">{naskah.isbn}</p>
              ) : (
                <p className="text-sm text-red-600">
                  Penulis belum mengisi ISBN. Hubungi penulis untuk melengkapi.
                </p>
              )}
            </div>

            {/* Status Dokumen */}
            <div
              className={`p-4 rounded-lg border ${dokumenLengkap ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {dokumenLengkap ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <span className="font-medium">Kelengkapan Dokumen</span>
              </div>
              <ul className="text-sm space-y-1">
                <li
                  className={
                    naskah.urlSuratPerjanjian
                      ? "text-green-700"
                      : "text-slate-400"
                  }
                >
                  {naskah.urlSuratPerjanjian ? "✓" : "○"} Surat Perjanjian
                </li>
                <li
                  className={
                    naskah.urlSuratKeaslian
                      ? "text-green-700"
                      : "text-slate-400"
                  }
                >
                  {naskah.urlSuratKeaslian ? "✓" : "○"} Surat Keaslian
                </li>
                <li
                  className={
                    naskah.urlProposalNaskah
                      ? "text-green-700"
                      : "text-slate-400"
                  }
                >
                  {naskah.urlProposalNaskah ? "✓" : "○"} Proposal Naskah
                </li>
                <li
                  className={
                    naskah.urlBuktiTransfer
                      ? "text-green-700"
                      : "text-slate-400"
                  }
                >
                  {naskah.urlBuktiTransfer ? "✓" : "○"} Bukti Transfer
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !siapTerbit}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menerbitkan...
                </>
              ) : (
                <>
                  <Book className="w-4 h-4 mr-2" />
                  Terbitkan Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
