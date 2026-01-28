"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  FileUp,
  Send,
  Loader2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { naskahApi } from "@/lib/api/naskah";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

interface EditorRevisiProps {
  idNaskah: string;
  kontenAwal?: string;
  onSuccess?: () => void;
}

/**
 * Komponen editor revisi dengan TipTap rich text editor
 * Penulis bisa edit langsung atau upload file
 */
export function EditorRevisi({
  idNaskah,
  kontenAwal = "",
  onSuccess,
}: EditorRevisiProps) {
  const [mode, setMode] = useState<"editor" | "upload">("editor");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Tulis revisi naskah di sini...",
      }),
    ],
    content: kontenAwal,
    immediatelyRender: false, // Fix SSR hydration mismatch di Next.js
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[400px] p-4 focus:outline-none",
      },
    },
  });

  // Dropzone untuk upload file
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validasi tipe file
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Hanya file PDF atau DOCX yang diizinkan");
      return;
    }

    // Validasi ukuran (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    setUploadedFile(file);
    setUploading(true);

    try {
      // Upload file ke server
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipe", "naskah");

      const response = await naskahApi.uploadFile(formData);
      if (response.sukses && response.data?.url) {
        setUploadedUrl(response.data.url);
        toast.success("File berhasil diupload");
      } else {
        throw new Error("Gagal mendapatkan URL file");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Gagal mengupload file");
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Submit revisi
  const handleSubmitRevisi = async () => {
    // Validasi berdasarkan mode
    if (mode === "editor") {
      const konten = editor?.getHTML();
      if (!konten || konten === "<p></p>" || konten.length < 100) {
        toast.error("Konten naskah minimal 100 karakter");
        return;
      }
    } else {
      if (!uploadedUrl) {
        toast.error("Silakan upload file terlebih dahulu");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        konten: mode === "editor" ? editor?.getHTML() : undefined,
        urlFile: mode === "upload" && uploadedUrl ? uploadedUrl : undefined,
        catatan: catatan || undefined,
      };

      const response = await naskahApi.submitRevisi(idNaskah, payload);

      if (response.sukses) {
        toast.success(response.pesan || "Revisi berhasil disubmit!");
        onSuccess?.();
      } else {
        throw new Error(response.pesan || "Gagal submit revisi");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Gagal submit revisi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
        <CardTitle className="flex items-center gap-2 text-lg text-teal-800">
          <FileText className="h-5 w-5 text-teal-600" />
          Revisi Naskah
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Tab Selector */}
        <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50">
          <button
            onClick={() => setMode("editor")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === "editor"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ✍️ Ketik Langsung
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === "upload"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            📁 Upload File
          </button>
        </div>

        {/* Mode Editor */}
        {mode === "editor" && editor && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-slate-200 transition-colors ${
                  editor.isActive("bold") ? "bg-slate-200 text-teal-700" : ""
                }`}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-slate-200 transition-colors ${
                  editor.isActive("italic") ? "bg-slate-200 text-teal-700" : ""
                }`}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`p-2 rounded hover:bg-slate-200 transition-colors ${
                  editor.isActive("heading", { level: 1 })
                    ? "bg-slate-200 text-teal-700"
                    : ""
                }`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`p-2 rounded hover:bg-slate-200 transition-colors ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-slate-200 text-teal-700"
                    : ""
                }`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={`p-2 rounded hover:bg-slate-200 transition-colors ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-slate-200 text-teal-700"
                    : ""
                }`}
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-slate-200 transition-colors ${
                  editor.isActive("bulletList")
                    ? "bg-slate-200 text-teal-700"
                    : ""
                }`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-slate-200 transition-colors ${
                  editor.isActive("orderedList")
                    ? "bg-slate-200 text-teal-700"
                    : ""
                }`}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-slate-300 mx-1 self-center" />
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded hover:bg-slate-200 transition-colors disabled:opacity-50"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
          </div>
        )}

        {/* Mode Upload */}
        {mode === "upload" && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-teal-500 bg-teal-50"
                : uploadedFile
                  ? "border-green-300 bg-green-50"
                  : "border-slate-300 hover:border-teal-400 hover:bg-slate-50"
            }`}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <p className="text-slate-600">Mengupload file...</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setUploadedUrl(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Hapus dan pilih ulang
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <FileUp className="w-10 h-10 text-slate-400" />
                <div>
                  <p className="font-medium text-slate-700">
                    {isDragActive
                      ? "Lepaskan file di sini..."
                      : "Drag & drop file atau klik untuk memilih"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Format: PDF, DOC, DOCX (Maks. 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Catatan Revisi */}
        <div className="space-y-2">
          <Label htmlFor="catatan" className="text-slate-700">
            Catatan Revisi (Opsional)
          </Label>
          <Textarea
            id="catatan"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Jelaskan perubahan apa saja yang Anda lakukan..."
            className="min-h-[100px] resize-y"
            maxLength={1000}
          />
          <p className="text-xs text-slate-500 text-right">
            {catatan.length}/1000 karakter
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitRevisi}
          disabled={loading || (mode === "upload" && !uploadedUrl)}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengirim Revisi...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Kirim Revisi
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Setelah mengirim revisi, naskah Anda akan direview ulang oleh editor.
        </p>
      </CardContent>
    </Card>
  );
}
