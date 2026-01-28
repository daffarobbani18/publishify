import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO untuk membuat paket penerbitan baru
 */
export class BuatPaketDto {
  @ApiProperty({ description: 'Kode unik paket', example: 'PAKET_BASIC' })
  @IsString()
  @MinLength(3)
  kode!: string;

  @ApiProperty({ description: 'Nama paket', example: 'Paket Basic' })
  @IsString()
  @MinLength(3)
  nama!: string;

  @ApiProperty({ description: 'Deskripsi lengkap paket' })
  @IsString()
  @MinLength(10)
  deskripsi!: string;

  @ApiProperty({ description: 'Harga paket dalam rupiah', example: 500000 })
  @IsNumber()
  @Min(0)
  harga!: number;

  @ApiProperty({ description: 'Jumlah minimum buku', example: 10 })
  @IsNumber()
  @Min(1)
  jumlahBukuMin!: number;

  @ApiPropertyOptional({ description: 'Termasuk proofreading', default: false })
  @IsBoolean()
  @IsOptional()
  termasukProofreading?: boolean;

  @ApiPropertyOptional({ description: 'Termasuk layout & desain', default: true })
  @IsBoolean()
  @IsOptional()
  termasukLayoutDesain?: boolean;

  @ApiPropertyOptional({ description: 'Termasuk pengurusan ISBN', default: true })
  @IsBoolean()
  @IsOptional()
  termasukISBN?: boolean;

  @ApiPropertyOptional({ description: 'Termasuk ebook', default: false })
  @IsBoolean()
  @IsOptional()
  termasukEbook?: boolean;

  @ApiPropertyOptional({ description: 'Jumlah revisi maksimal', default: 2 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  revisiMaksimal?: number;

  @ApiPropertyOptional({ description: 'Fitur tambahan', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fiturTambahan?: string[];

  @ApiPropertyOptional({ description: 'Urutan tampilan', default: 0 })
  @IsNumber()
  @IsOptional()
  urutan?: number;
}

/**
 * DTO untuk memperbarui paket penerbitan
 */
export class PerbaruiPaketDto {
  @ApiPropertyOptional({ description: 'Nama paket' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  nama?: string;

  @ApiPropertyOptional({ description: 'Deskripsi lengkap paket' })
  @IsString()
  @MinLength(10)
  @IsOptional()
  deskripsi?: string;

  @ApiPropertyOptional({ description: 'Harga paket dalam rupiah' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  harga?: number;

  @ApiPropertyOptional({ description: 'Jumlah minimum buku' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  jumlahBukuMin?: number;

  @ApiPropertyOptional({ description: 'Termasuk proofreading' })
  @IsBoolean()
  @IsOptional()
  termasukProofreading?: boolean;

  @ApiPropertyOptional({ description: 'Termasuk layout & desain' })
  @IsBoolean()
  @IsOptional()
  termasukLayoutDesain?: boolean;

  @ApiPropertyOptional({ description: 'Termasuk pengurusan ISBN' })
  @IsBoolean()
  @IsOptional()
  termasukISBN?: boolean;

  @ApiPropertyOptional({ description: 'Termasuk ebook' })
  @IsBoolean()
  @IsOptional()
  termasukEbook?: boolean;

  @ApiPropertyOptional({ description: 'Jumlah revisi maksimal' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  revisiMaksimal?: number;

  @ApiPropertyOptional({ description: 'Fitur tambahan', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fiturTambahan?: string[];

  @ApiPropertyOptional({ description: 'Aktif/nonaktif paket' })
  @IsBoolean()
  @IsOptional()
  aktif?: boolean;

  @ApiPropertyOptional({ description: 'Urutan tampilan' })
  @IsNumber()
  @IsOptional()
  urutan?: number;
}
