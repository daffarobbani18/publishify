import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Schema Zod untuk validasi registrasi pengguna baru
 */
export const DaftarSchema = z
  .object({
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

    konfirmasiKataSandi: z.string({
      required_error: 'Konfirmasi kata sandi wajib diisi',
    }),

    namaDepan: z
      .string({
        required_error: 'Nama depan wajib diisi',
      })
      .min(2, 'Nama depan minimal 2 karakter')
      .max(50, 'Nama depan maksimal 50 karakter')
      .trim(),

    namaBelakang: z.string().max(50, 'Nama belakang maksimal 50 karakter').trim().optional(),

    telepon: z
      .string()
      .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid')
      .optional(),

    jenisPeran: z
      .enum(['penulis', 'editor'], {
        required_error: 'Jenis peran wajib dipilih',
        invalid_type_error: 'Jenis peran tidak valid',
      })
      .default('penulis'),

    alamat: z.string().max(255, 'Alamat maksimal 255 karakter').trim().optional(),

    kota: z.string().max(100, 'Kota maksimal 100 karakter').trim().optional(),

    provinsi: z.string().max(100, 'Provinsi maksimal 100 karakter').trim().optional(),

    kodePos: z.string().max(10, 'Kode pos maksimal 10 karakter').trim().optional(),
  })
  .refine((data) => data.kataSandi === data.konfirmasiKataSandi, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['konfirmasiKataSandi'],
  });

/**
 * Type inference dari Zod schema
 */
export type DaftarDto = z.infer<typeof DaftarSchema>;

/**
 * Class untuk Swagger documentation
 */
export class DaftarDtoClass {
  @ApiProperty({
    description: 'Alamat email pengguna',
    example: 'penulis@publishify.com',
    type: String,
  })
  email!: string;

  @ApiProperty({
    description:
      'Kata sandi pengguna (minimal 8 karakter, harus ada huruf besar, kecil, dan angka)',
    example: 'Password123!',
    minLength: 8,
    maxLength: 100,
    type: String,
  })
  kataSandi!: string;

  @ApiProperty({
    description: 'Konfirmasi kata sandi (harus sama dengan kata sandi)',
    example: 'Password123!',
    type: String,
  })
  konfirmasiKataSandi!: string;

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
    description: 'Nomor telepon pengguna (format Indonesia)',
    example: '081234567890',
    required: false,
    type: String,
  })
  telepon?: string;

  @ApiProperty({
    description: 'Peran yang dipilih saat registrasi',
    enum: ['penulis', 'editor'],
    default: 'penulis',
    example: 'penulis',
    type: String,
  })
  jenisPeran!: 'penulis' | 'editor';

  @ApiProperty({
    description: 'Alamat lengkap pengguna',
    example: 'Jl. Merdeka No. 123',
    required: false,
    maxLength: 255,
    type: String,
  })
  alamat?: string;

  @ApiProperty({
    description: 'Kota tempat tinggal',
    example: 'Bandung',
    required: false,
    maxLength: 100,
    type: String,
  })
  kota?: string;

  @ApiProperty({
    description: 'Provinsi tempat tinggal',
    example: 'Jawa Barat',
    required: false,
    maxLength: 100,
    type: String,
  })
  provinsi?: string;

  @ApiProperty({
    description: 'Kode pos',
    example: '40123',
    required: false,
    maxLength: 10,
    type: String,
  })
  kodePos?: string;
}
