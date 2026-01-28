import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Custom validator untuk URL atau path relatif
 * Menerima URL lengkap (http://, https://) atau path relatif (/uploads/...)
 */
const urlAtauPath = (fieldName: string) =>
  z
    .string()
    .refine(
      (val) => {
        // Terima URL lengkap atau path relatif yang dimulai dengan /
        return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/');
      },
      { message: `${fieldName} harus berupa URL valid atau path yang dimulai dengan /` },
    )
    .optional()
    .nullable();

/**
 * Enum untuk format/ukuran buku
 */
export const FormatBukuEnum = z.enum(['A4', 'A5', 'B5'], {
  errorMap: () => ({ message: 'Format buku harus A4, A5, atau B5' }),
});

export type FormatBuku = z.infer<typeof FormatBukuEnum>;

/**
 * Schema Zod untuk membuat naskah baru
 */
export const BuatNaskahSchema = z.object({
  judul: z
    .string({
      required_error: 'Judul wajib diisi',
    })
    .min(3, 'Judul minimal 3 karakter')
    .max(200, 'Judul maksimal 200 karakter')
    .trim(),

  subJudul: z.string().max(200, 'Sub judul maksimal 200 karakter').trim().optional().nullable(),

  sinopsis: z
    .string({
      required_error: 'Sinopsis wajib diisi',
    })
    .min(50, 'Sinopsis minimal 50 karakter')
    .max(2000, 'Sinopsis maksimal 2000 karakter')
    .trim(),

  idKategori: z
    .string({
      required_error: 'Kategori wajib dipilih',
    })
    .uuid('ID kategori harus berupa UUID'),

  idGenre: z
    .string({
      required_error: 'Genre wajib dipilih',
    })
    .uuid('ID genre harus berupa UUID'),

  formatBuku: FormatBukuEnum.default('A5').optional(),

  bahasaTulis: z
    .string()
    .length(2, 'Kode bahasa harus 2 karakter (ISO 639-1)')
    .default('id')
    .optional(),

  jumlahHalaman: z
    .number()
    .int('Jumlah halaman harus bilangan bulat')
    .min(1, 'Jumlah halaman minimal 1')
    .optional()
    .nullable(),

  jumlahKata: z
    .number()
    .int('Jumlah kata harus bilangan bulat')
    .min(100, 'Jumlah kata minimal 100')
    .optional()
    .nullable(),

  urlSampul: urlAtauPath('URL sampul'),

  urlFile: urlAtauPath('URL file'),

  // Konten naskah dari rich text editor (HTML)
  // Akan dikonversi ke DOCX jika diisi
  konten: z.string().min(100, 'Konten naskah minimal 100 karakter').optional().nullable(),

  publik: z.boolean().default(false).optional(),
});

/**
 * Type inference dari Zod schema
 */
export type BuatNaskahDto = z.infer<typeof BuatNaskahSchema>;

/**
 * Class untuk Swagger documentation
 */
export class BuatNaskahDtoClass {
  @ApiProperty({
    description: 'Judul naskah',
    example: 'Perjalanan ke Negeri Dongeng',
    minLength: 3,
    maxLength: 200,
    type: String,
  })
  judul!: string;

  @ApiProperty({
    description: 'Sub judul naskah',
    example: 'Petualangan Seru di Dunia Fantasi',
    required: false,
    maxLength: 200,
    type: String,
  })
  subJudul?: string;

  @ApiProperty({
    description: 'Sinopsis naskah',
    example: 'Cerita tentang seorang anak yang menemukan portal ajaib ke negeri dongeng...',
    minLength: 50,
    maxLength: 2000,
    type: String,
  })
  sinopsis!: string;

  @ApiProperty({
    description: 'ID kategori naskah',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  idKategori!: string;

  @ApiProperty({
    description: 'ID genre naskah',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: String,
  })
  idGenre!: string;

  @ApiProperty({
    description: 'Format/ukuran buku (A4, A5, atau B5)',
    example: 'A5',
    enum: ['A4', 'A5', 'B5'],
    default: 'A5',
    required: false,
    type: String,
  })
  formatBuku?: 'A4' | 'A5' | 'B5';

  @ApiProperty({
    description: 'Bahasa tulisan (kode ISO 639-1)',
    example: 'id',
    default: 'id',
    required: false,
    type: String,
  })
  bahasaTulis?: string;

  @ApiProperty({
    description: 'Jumlah halaman naskah',
    example: 250,
    required: false,
    type: Number,
  })
  jumlahHalaman?: number;

  @ApiProperty({
    description: 'Jumlah kata dalam naskah',
    example: 75000,
    required: false,
    type: Number,
  })
  jumlahKata?: number;

  @ApiProperty({
    description: 'URL sampul/cover naskah',
    example: 'https://storage.publishify.com/covers/cover-123.jpg',
    required: false,
    type: String,
  })
  urlSampul?: string;

  @ApiProperty({
    description: 'URL file naskah (PDF/DOCX)',
    example: 'https://storage.publishify.com/manuscripts/manuscript-123.pdf',
    required: false,
    type: String,
  })
  urlFile?: string;

  @ApiProperty({
    description: 'Status publik (dapat dilihat publik atau tidak)',
    default: false,
    required: false,
    type: Boolean,
  })
  publik?: boolean;
}
