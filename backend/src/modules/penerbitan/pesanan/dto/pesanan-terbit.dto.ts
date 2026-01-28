import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JenisSampul, JenisKertas, JenisJilid } from '@prisma/client';

/**
 * DTO untuk membuat pesanan terbit baru
 */
export class BuatPesananTerbitDto {
  @ApiProperty({ description: 'ID naskah yang akan diterbitkan' })
  @IsUUID()
  idNaskah!: string;

  @ApiProperty({ description: 'ID paket penerbitan yang dipilih' })
  @IsUUID()
  idPaket!: string;

  @ApiProperty({ description: 'Jumlah buku yang dipesan', example: 50 })
  @IsNumber()
  @Min(1)
  jumlahBuku!: number;

  @ApiPropertyOptional({ description: 'Catatan dari penulis' })
  @IsString()
  @IsOptional()
  catatanPenulis?: string;
}

/**
 * DTO untuk spesifikasi buku
 */
export class SpesifikasiBukuDto {
  @ApiPropertyOptional({ description: 'Jenis sampul', enum: JenisSampul })
  @IsEnum(JenisSampul)
  @IsOptional()
  jenisSampul?: JenisSampul;

  @ApiPropertyOptional({ description: 'Lapisan sampul (glossy/doff)', default: 'doff' })
  @IsString()
  @IsOptional()
  lapisSampul?: string;

  @ApiPropertyOptional({ description: 'Jenis kertas isi', enum: JenisKertas })
  @IsEnum(JenisKertas)
  @IsOptional()
  jenisKertas?: JenisKertas;

  @ApiPropertyOptional({ description: 'Ukuran buku (A5, A4, B5, Custom)', default: 'A5' })
  @IsString()
  @IsOptional()
  ukuranBuku?: string;

  @ApiPropertyOptional({ description: 'Panjang custom dalam mm' })
  @IsNumber()
  @IsOptional()
  ukuranCustomPanjang?: number;

  @ApiPropertyOptional({ description: 'Lebar custom dalam mm' })
  @IsNumber()
  @IsOptional()
  ukuranCustomLebar?: number;

  @ApiPropertyOptional({ description: 'Jenis jilid', enum: JenisJilid })
  @IsEnum(JenisJilid)
  @IsOptional()
  jenisJilid?: JenisJilid;

  @ApiPropertyOptional({ description: 'Laminasi (glossy/doff)', default: 'doff' })
  @IsString()
  @IsOptional()
  laminasi?: string;

  @ApiPropertyOptional({ description: 'Tambah pembatas buku', default: false })
  @IsBoolean()
  @IsOptional()
  pembatasBuku?: boolean;

  @ApiPropertyOptional({ description: 'Packing khusus', default: false })
  @IsBoolean()
  @IsOptional()
  packingKhusus?: boolean;

  @ApiPropertyOptional({ description: 'Catatan tambahan spesifikasi' })
  @IsString()
  @IsOptional()
  catatanTambahan?: string;
}

/**
 * DTO untuk kelengkapan naskah
 */
export class KelengkapanNaskahDto {
  @ApiPropertyOptional({ description: 'Ada kata pengantar', default: false })
  @IsBoolean()
  @IsOptional()
  adaKataPengantar?: boolean;

  @ApiPropertyOptional({ description: 'Ada daftar isi', default: false })
  @IsBoolean()
  @IsOptional()
  adaDaftarIsi?: boolean;

  @ApiPropertyOptional({ description: 'Ada bab isi', default: false })
  @IsBoolean()
  @IsOptional()
  adaBabIsi?: boolean;

  @ApiPropertyOptional({ description: 'Ada daftar pustaka', default: false })
  @IsBoolean()
  @IsOptional()
  adaDaftarPustaka?: boolean;

  @ApiPropertyOptional({ description: 'Ada tentang penulis', default: false })
  @IsBoolean()
  @IsOptional()
  adaTentangPenulis?: boolean;

  @ApiPropertyOptional({ description: 'Ada sinopsis', default: false })
  @IsBoolean()
  @IsOptional()
  adaSinopsis?: boolean;

  @ApiPropertyOptional({ description: 'Ada lampiran (opsional)', default: false })
  @IsBoolean()
  @IsOptional()
  adaLampiran?: boolean;

  @ApiPropertyOptional({ description: 'URL file kata pengantar' })
  @IsString()
  @IsOptional()
  urlKataPengantar?: string;

  @ApiPropertyOptional({ description: 'URL file daftar isi' })
  @IsString()
  @IsOptional()
  urlDaftarIsi?: string;

  @ApiPropertyOptional({ description: 'URL file daftar pustaka' })
  @IsString()
  @IsOptional()
  urlDaftarPustaka?: string;

  @ApiPropertyOptional({ description: 'URL file tentang penulis' })
  @IsString()
  @IsOptional()
  urlTentangPenulis?: string;

  @ApiPropertyOptional({ description: 'URL file sinopsis' })
  @IsString()
  @IsOptional()
  urlSinopsis?: string;

  @ApiPropertyOptional({ description: 'URL file lampiran' })
  @IsString()
  @IsOptional()
  urlLampiran?: string;

  @ApiPropertyOptional({ description: 'Catatan kelengkapan' })
  @IsString()
  @IsOptional()
  catatanKelengkapan?: string;
}

/**
 * DTO untuk update status oleh admin/editor
 */
export class UpdateStatusPesananDto {
  @ApiProperty({ description: 'Status baru pesanan' })
  @IsString()
  status!: string;

  @ApiPropertyOptional({ description: 'Catatan perubahan status' })
  @IsString()
  @IsOptional()
  catatan?: string;
}

/**
 * DTO untuk filter pesanan
 */
export class FilterPesananDto {
  @ApiPropertyOptional({ description: 'Filter berdasarkan status' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan status pembayaran' })
  @IsString()
  @IsOptional()
  statusPembayaran?: string;

  @ApiPropertyOptional({ description: 'Halaman', default: 1 })
  @IsNumber()
  @IsOptional()
  halaman?: number;

  @ApiPropertyOptional({ description: 'Limit per halaman', default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
