import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum untuk tipe file yang diperbolehkan
 */
export enum TipeFile {
  NASKAH = 'naskah', // PDF, DOCX untuk manuscript
  SAMPUL = 'sampul', // JPG, PNG untuk cover
  GAMBAR = 'gambar', // JPG, PNG untuk images
  DOKUMEN = 'dokumen', // PDF, DOCX untuk documents
}

/**
 * Zod Schema untuk upload file
 */
export const UploadFileSchema = z.object({
  tujuan: z
    .nativeEnum(TipeFile, {
      errorMap: () => ({
        message: 'Tujuan upload harus salah satu dari: naskah, sampul, gambar, dokumen',
      }),
    })
    .describe('Tujuan upload file (naskah/sampul/gambar/dokumen)'),

  deskripsi: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .describe('Deskripsi file (opsional)'),

  idReferensi: z
    .string()
    .uuid('ID referensi harus berupa UUID')
    .optional()
    .describe('ID referensi ke entitas lain (naskah, pengguna, dll)'),
});

export type UploadFileDto = z.infer<typeof UploadFileSchema>;

/**
 * Class untuk Swagger documentation
 */
export class UploadFileSwagger {
  @ApiProperty({
    enum: TipeFile,
    description: 'Tujuan upload file',
    example: TipeFile.NASKAH,
  })
  tujuan!: TipeFile;

  @ApiProperty({
    description: 'Deskripsi file (opsional)',
    example: 'Naskah versi final',
    required: false,
    maxLength: 500,
  })
  deskripsi?: string;

  @ApiProperty({
    description: 'ID referensi ke entitas lain (opsional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  idReferensi?: string;
}

/**
 * Konfigurasi file upload berdasarkan tipe
 */
export const UPLOAD_CONFIG: Record<
  TipeFile,
  {
    mimeTypes: readonly string[];
    extensions: readonly string[];
    maxSize: number;
    description: string;
  }
> = {
  [TipeFile.NASKAH]: {
    mimeTypes: [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain', // .txt - untuk mode tulis langsung
    ] as const,
    extensions: ['.pdf', '.doc', '.docx', '.txt'] as const,
    maxSize: 50 * 1024 * 1024, // 50MB
    description: 'File naskah (PDF, DOC, DOCX, atau TXT)',
  },
  [TipeFile.SAMPUL]: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    extensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'Gambar sampul buku (JPEG, PNG, atau WebP)',
  },
  [TipeFile.GAMBAR]: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const,
    maxSize: 5 * 1024 * 1024, // 5MB
    description: 'Gambar umum (JPEG, PNG, WebP, atau GIF)',
  },
  [TipeFile.DOKUMEN]: {
    mimeTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/webp',
    ] as const,
    extensions: ['.pdf', '.docx', '.xlsx', '.jpg', '.jpeg', '.png', '.webp'] as const,
    maxSize: 20 * 1024 * 1024, // 20MB
    description: 'Dokumen pendukung (PDF, DOCX, XLSX, atau Gambar)',
  },
};
