import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk membuat pengguna baru (Admin only)
 */
export const BuatPenggunaSchema = z.object({
  email: z
    .string({
      required_error: 'Email wajib diisi',
    })
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),

  kataSandi: z
    .string({
      required_error: 'Kata sandi wajib diisi',
    })
    .min(8, 'Kata sandi minimal 8 karakter')
    .max(100, 'Kata sandi maksimal 100 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Kata sandi harus mengandung huruf besar, huruf kecil, dan angka',
    ),

  telepon: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid')
    .optional(),

  namaDepan: z
    .string({
      required_error: 'Nama depan wajib diisi',
    })
    .min(2, 'Nama depan minimal 2 karakter')
    .max(50, 'Nama depan maksimal 50 karakter')
    .trim(),

  namaBelakang: z.string().max(50, 'Nama belakang maksimal 50 karakter').trim().optional(),

  jenisPeran: z
    .enum(['penulis', 'editor', 'admin'], {
      required_error: 'Jenis peran wajib dipilih',
      invalid_type_error: 'Jenis peran tidak valid',
    })
    .default('penulis'),

  aktif: z.boolean().default(true),
});

/**
 * Type inference dari Zod schema
 */
export type BuatPenggunaDto = z.infer<typeof BuatPenggunaSchema>;

/**
 * Class untuk Swagger documentation
 */
export class BuatPenggunaDtoClass {
  @ApiProperty({
    description: 'Alamat email pengguna',
    example: 'user@publishify.com',
    type: String,
  })
  email!: string;

  @ApiProperty({
    description: 'Kata sandi pengguna',
    example: 'Password123!',
    minLength: 8,
    maxLength: 100,
    type: String,
  })
  kataSandi!: string;

  @ApiProperty({
    description: 'Nomor telepon pengguna',
    example: '081234567890',
    required: false,
    type: String,
  })
  telepon?: string;

  @ApiProperty({
    description: 'Nama depan pengguna',
    example: 'John',
    minLength: 2,
    maxLength: 50,
    type: String,
  })
  namaDepan!: string;

  @ApiProperty({
    description: 'Nama belakang pengguna',
    example: 'Doe',
    required: false,
    maxLength: 50,
    type: String,
  })
  namaBelakang?: string;

  @ApiProperty({
    description: 'Peran pengguna',
    enum: ['penulis', 'editor', 'admin'],
    default: 'penulis',
    example: 'penulis',
    type: String,
  })
  jenisPeran!: 'penulis' | 'editor' | 'admin';

  @ApiProperty({
    description: 'Status aktif pengguna',
    default: true,
    type: Boolean,
  })
  aktif!: boolean;
}
