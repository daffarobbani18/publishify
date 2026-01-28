import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { StatusReview, Rekomendasi } from '@prisma/client';

/**
 * Schema Zod untuk update review (status tracking)
 */
export const PerbaruiReviewSchema = z.object({
  status: z.nativeEnum(StatusReview).optional(),

  rekomendasi: z.nativeEnum(Rekomendasi).optional(),

  catatan: z.string().max(1000, 'Catatan maksimal 1000 karakter').trim().optional().nullable(),

  dimulaiPada: z.string().datetime('Format tanggal tidak valid').optional().nullable(),
});

/**
 * Type inference dari Zod schema
 */
export type PerbaruiReviewDto = z.infer<typeof PerbaruiReviewSchema>;

/**
 * Class untuk Swagger documentation
 */
export class PerbaruiReviewDtoClass {
  @ApiProperty({
    description: 'Status review',
    enum: StatusReview,
    required: false,
  })
  status?: StatusReview;

  @ApiProperty({
    description: 'Rekomendasi review (setujui, revisi, tolak)',
    enum: Rekomendasi,
    required: false,
  })
  rekomendasi?: Rekomendasi;

  @ApiProperty({
    description: 'Catatan review',
    example: 'Review sedang dalam proses, fokus pada bab 1-5',
    required: false,
    maxLength: 1000,
    type: String,
  })
  catatan?: string;

  @ApiProperty({
    description: 'Waktu mulai review (ISO 8601 format)',
    example: '2025-10-29T10:00:00.000Z',
    required: false,
    type: String,
  })
  dimulaiPada?: string;
}
