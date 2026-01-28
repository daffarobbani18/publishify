import { z } from 'zod';

/**
 * Custom validator untuk URL atau path relatif
 * Menerima URL lengkap (http://, https://) atau path relatif (/uploads/...)
 */
const urlAtauPath = z
  .string()
  .refine(
    (val) => {
      // Terima URL lengkap atau path relatif yang dimulai dengan /
      return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/');
    },
    { message: 'URL file harus berupa URL valid atau path yang dimulai dengan /' },
  )
  .optional();

/**
 * DTO untuk submit revisi naskah oleh penulis
 * Penulis bisa submit melalui:
 * 1. Konten HTML dari rich text editor
 * 2. Upload file DOCX/PDF
 * 3. Keduanya
 */
export const SubmitRevisiSchema = z
  .object({
    // Konten HTML dari TipTap editor (opsional jika upload file)
    konten: z.string().min(100, 'Konten minimal 100 karakter').optional(),

    // URL file yang diupload (opsional jika menggunakan editor)
    urlFile: urlAtauPath,

    // Catatan perubahan yang dilakukan
    catatan: z.string().max(1000, 'Catatan maksimal 1000 karakter').optional(),
  })
  .refine((data) => data.konten || data.urlFile, {
    message: 'Harus mengisi konten atau upload file',
  });

export type SubmitRevisiDto = z.infer<typeof SubmitRevisiSchema>;
