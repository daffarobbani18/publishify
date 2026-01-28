import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk filter pengguna
 */
export const FilterPenggunaSchema = z.object({
  halaman: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cari: z.string().optional(),
  peran: z.enum(['penulis', 'editor', 'admin']).optional(),
  aktif: z.coerce.boolean().optional(),
  terverifikasi: z.coerce.boolean().optional(),
  urutkan: z.enum(['dibuatPada', 'email', 'namaDepan']).default('dibuatPada'),
  arah: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Type inference dari Zod schema
 */
export type FilterPenggunaDto = z.infer<typeof FilterPenggunaSchema>;

/**
 * Class untuk Swagger documentation
 */
export class FilterPenggunaDtoClass {
  @ApiProperty({
    description: 'Halaman yang diminta',
    example: 1,
    default: 1,
    minimum: 1,
    type: Number,
    required: false,
  })
  halaman?: number;

  @ApiProperty({
    description: 'Jumlah data per halaman',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    type: Number,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Pencarian (email, nama depan, nama belakang)',
    example: 'john',
    required: false,
    type: String,
  })
  cari?: string;

  @ApiProperty({
    description: 'Filter berdasarkan peran',
    enum: ['penulis', 'editor', 'admin'],
    required: false,
    type: String,
  })
  peran?: 'penulis' | 'editor' | 'admin';

  @ApiProperty({
    description: 'Filter berdasarkan status aktif',
    required: false,
    type: Boolean,
  })
  aktif?: boolean;

  @ApiProperty({
    description: 'Filter berdasarkan status verifikasi',
    required: false,
    type: Boolean,
  })
  terverifikasi?: boolean;

  @ApiProperty({
    description: 'Field untuk sorting',
    enum: ['dibuatPada', 'email', 'namaDepan'],
    default: 'dibuatPada',
    required: false,
    type: String,
  })
  urutkan?: 'dibuatPada' | 'email' | 'namaDepan';

  @ApiProperty({
    description: 'Arah sorting',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
    type: String,
  })
  arah?: 'asc' | 'desc';
}
