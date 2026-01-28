import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  Res,
  StreamableFile,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { UploadService } from './upload.service';
import {
  UploadFileDto,
  FilterFileDto,
  ProcessImageDto,
  ProcessImageSwagger,
  UploadResponseDto,
  UploadMultipleResponseDto,
  IMAGE_PRESETS,
} from './dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PeranGuard } from '@/modules/auth/guards/roles.guard';
import { Peran } from '@/modules/auth/decorators/peran.decorator';
import { PenggunaSaatIni } from '@/modules/auth/decorators/pengguna-saat-ini.decorator';
import { ValidasiZodPipe } from '@/common/pipes/validasi-zod.pipe';
import { UploadFileSchema } from './dto/upload-file.dto';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
@UseGuards(JwtAuthGuard, PeranGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /upload/single - Upload single file
   */
  @Post('single')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload single file',
    description:
      'Upload single file (naskah PDF/DOCX, sampul image, dokumen). Max size tergantung tipe file.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'tujuan'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        tujuan: {
          type: 'string',
          enum: ['naskah', 'sampul', 'gambar', 'dokumen'],
          description: 'Tujuan upload',
        },
        deskripsi: {
          type: 'string',
          description: 'Deskripsi file (optional)',
        },
        idReferensi: {
          type: 'string',
          description: 'ID referensi ke entitas lain (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File berhasil diupload',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File tidak valid (tipe/ukuran tidak sesuai)',
  })
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidasiZodPipe(UploadFileSchema)) dto: UploadFileDto,
    @PenggunaSaatIni('id') idPengguna: string,
  ): Promise<{ sukses: boolean; pesan: string; data: UploadResponseDto }> {
    const result = await this.uploadService.uploadFile(file, dto, idPengguna);
    return {
      sukses: true,
      pesan: 'File berhasil diupload',
      data: result,
    };
  }

  /**
   * POST /upload/multiple - Upload multiple files
   */
  @Post('multiple')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10)) // max 10 files
  @ApiOperation({
    summary: 'Upload multiple files',
    description: 'Upload multiple files sekaligus (max 10 files per request)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files', 'tujuan'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Files to upload (max 10)',
        },
        tujuan: {
          type: 'string',
          enum: ['naskah', 'sampul', 'gambar', 'dokumen'],
          description: 'Tujuan upload',
        },
        deskripsi: {
          type: 'string',
          description: 'Deskripsi file (optional)',
        },
        idReferensi: {
          type: 'string',
          description: 'ID referensi ke entitas lain (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files berhasil diupload',
    type: UploadMultipleResponseDto,
  })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body(new ValidasiZodPipe(UploadFileSchema)) dto: UploadFileDto,
    @PenggunaSaatIni('id') idPengguna: string,
  ) {
    const result = await this.uploadService.uploadMultiple(files, dto, idPengguna);
    return {
      sukses: true,
      pesan: `${result.totalBerhasil} file berhasil diupload, ${result.totalGagal} file gagal`,
      data: result,
    };
  }

  /**
   * GET /upload - List files dengan pagination
   */
  @Get()
  @Peran('penulis', 'editor', 'admin')
  @ApiOperation({
    summary: 'List files dengan pagination dan filter',
    description:
      'Ambil daftar file dengan pagination. Support filter berdasarkan tujuan, pengguna, referensi, dll.',
  })
  @ApiQuery({ name: 'halaman', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'tujuan',
    required: false,
    enum: ['naskah', 'sampul', 'gambar', 'dokumen'],
  })
  @ApiQuery({ name: 'idPengguna', required: false, type: String })
  @ApiQuery({ name: 'idReferensi', required: false, type: String })
  @ApiQuery({ name: 'mimeType', required: false, type: String })
  @ApiQuery({ name: 'cari', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Daftar file berhasil diambil',
  })
  async listFiles(@Query() filter: FilterFileDto) {
    return this.uploadService.listFiles(filter);
  }

  /**
   * GET /upload/metadata/:id - Get file metadata
   */
  @Get('metadata/:id')
  @Peran('penulis', 'editor', 'admin')
  @ApiOperation({
    summary: 'Get file metadata by ID',
    description: 'Ambil detail metadata file (termasuk info pengguna yang upload)',
  })
  @ApiParam({ name: 'id', type: String, description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'Metadata file berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'File tidak ditemukan',
  })
  async getFileMetadata(@Param('id') id: string) {
    return this.uploadService.getFileMetadata(id);
  }

  /**
   * GET /upload/template/naskah - Download template naskah buku
   */
  @Get('template/naskah')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Download template naskah buku',
    description:
      'Download file template naskah buku dalam format .doc. Endpoint ini bersifat publik dan tidak memerlukan autentikasi.',
  })
  @ApiResponse({
    status: 200,
    description: 'Template berhasil diunduh',
    content: {
      'application/msword': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File template tidak ditemukan',
  })
  async downloadTemplateNaskah(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    try {
      const templatePath = join(process.cwd(), 'template', 'template-buku-publishify.doc');
      const file = createReadStream(templatePath);

      res.set({
        'Content-Type': 'application/msword',
        'Content-Disposition': 'attachment; filename="template-buku-publishify.doc"',
      });

      return new StreamableFile(file);
    } catch (error) {
      throw new NotFoundException('File template tidak ditemukan');
    }
  }

  /**
   * GET /upload/:id - Get file URL
   */
  @Get(':id')
  @Peran('penulis', 'editor', 'admin')
  @ApiOperation({
    summary: 'Get file URL by ID',
    description: 'Ambil URL untuk mengakses file',
  })
  @ApiParam({ name: 'id', type: String, description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'URL file berhasil diambil',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: '/uploads/naskah/2024-01-15_file_abc123.pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File tidak ditemukan',
  })
  async getFileUrl(@Param('id') id: string) {
    const url = await this.uploadService.getFileUrl(id);
    return {
      sukses: true,
      url,
    };
  }

  /**
   * DELETE /upload/:id - Delete file
   */
  @Delete(':id')
  @Peran('penulis', 'editor', 'admin')
  @ApiOperation({
    summary: 'Delete file by ID',
    description: 'Hapus file dari server. Hanya owner atau admin yang bisa menghapus.',
  })
  @ApiParam({ name: 'id', type: String, description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File berhasil dihapus',
  })
  @ApiResponse({
    status: 403,
    description: 'Tidak memiliki akses untuk menghapus file',
  })
  @ApiResponse({
    status: 404,
    description: 'File tidak ditemukan',
  })
  async deleteFile(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPengguna: string,
    @PenggunaSaatIni('peran') peranPengguna: string[],
  ) {
    return this.uploadService.deleteFile(id, idPengguna, peranPengguna);
  }

  /**
   * POST /upload/image/:id/process - Process image (resize/compress)
   */
  @Post('image/:id/process')
  @Peran('penulis', 'editor', 'admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Process image (resize/compress)',
    description: 'Resize dan compress gambar. Membuat file baru dengan proses yang diterapkan.',
  })
  @ApiParam({ name: 'id', type: String, description: 'File ID (gambar)' })
  @ApiBody({ type: ProcessImageSwagger })
  @ApiResponse({
    status: 201,
    description: 'Gambar berhasil diproses',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File bukan gambar atau parameter tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'File tidak ditemukan',
  })
  async processImage(
    @Param('id') id: string,
    @Body() dto: ProcessImageDto,
    @PenggunaSaatIni('id') idPengguna: string,
  ) {
    const result = await this.uploadService.processImage(id, dto, idPengguna);
    return {
      sukses: true,
      pesan: 'Gambar berhasil diproses',
      data: result,
    };
  }

  /**
   * POST /upload/image/:id/preset/:preset - Process image dengan preset
   */
  @Post('image/:id/preset/:preset')
  @Peran('penulis', 'editor', 'admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Process image dengan preset',
    description:
      'Resize dan compress gambar menggunakan preset yang sudah ditentukan (thumbnail, sampulKecil, sampulBesar, banner)',
  })
  @ApiParam({ name: 'id', type: String, description: 'File ID (gambar)' })
  @ApiParam({
    name: 'preset',
    enum: ['thumbnail', 'sampulKecil', 'sampulBesar', 'banner'],
    description: 'Preset name',
  })
  @ApiResponse({
    status: 201,
    description: 'Gambar berhasil diproses dengan preset',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File bukan gambar atau preset tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'File tidak ditemukan',
  })
  async processImagePreset(
    @Param('id') id: string,
    @Param('preset') preset: keyof typeof IMAGE_PRESETS,
    @PenggunaSaatIni('id') idPengguna: string,
  ) {
    const result = await this.uploadService.processImageWithPreset(id, preset, idPengguna);
    return {
      sukses: true,
      pesan: `Gambar berhasil diproses dengan preset "${preset}"`,
      data: result,
    };
  }

  /**
   * POST /upload/konversi-pdf/:id - Konversi file DOCX ke PDF berdasarkan ID file
   */
  @Post('konversi-pdf/:id')
  @HttpCode(HttpStatus.CREATED)
  @Peran('admin', 'penulis', 'editor')
  @ApiOperation({
    summary: 'Konversi DOCX ke PDF',
    description:
      'Konversi file DOCX/DOC ke PDF menggunakan LibreOffice. Membutuhkan LibreOffice terinstall di server.',
  })
  @ApiParam({ name: 'id', type: String, description: 'File ID (DOCX/DOC)' })
  @ApiResponse({
    status: 201,
    description: 'File berhasil dikonversi ke PDF',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'File bukan DOCX/DOC',
  })
  @ApiResponse({
    status: 404,
    description: 'File tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'LibreOffice tidak terinstall atau error konversi',
  })
  async konversiDocxKePdf(@Param('id') id: string, @PenggunaSaatIni('id') idPengguna: string) {
    const result = await this.uploadService.konversiDocxKePdf(id, idPengguna);
    return {
      sukses: true,
      pesan: 'File berhasil dikonversi ke PDF',
      data: result,
    };
  }

  /**
   * POST /upload/konversi-pdf-url - Konversi file DOCX ke PDF berdasarkan URL file
   */
  @Post('konversi-pdf-url')
  @HttpCode(HttpStatus.CREATED)
  @Peran('admin', 'penulis', 'editor')
  @ApiOperation({
    summary: 'Konversi DOCX ke PDF dari URL',
    description:
      'Konversi file DOCX/DOC ke PDF menggunakan LibreOffice berdasarkan URL file. Membutuhkan LibreOffice terinstall di server.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['fileUrl'],
      properties: {
        fileUrl: {
          type: 'string',
          description: 'URL file DOCX/DOC (format: /uploads/naskah/filename.docx)',
          example: '/uploads/naskah/2024-01-15_file_abc123.docx',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File berhasil dikonversi ke PDF',
    schema: {
      type: 'object',
      properties: {
        sukses: { type: 'boolean', example: true },
        pesan: { type: 'string', example: 'File berhasil dikonversi ke PDF' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            url: { type: 'string', example: '/uploads/naskah/2024-01-15_file_abc123.pdf' },
            namaFileAsli: { type: 'string' },
            ukuran: { type: 'number' },
            mimeType: { type: 'string', example: 'application/pdf' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'File bukan DOCX/DOC',
  })
  @ApiResponse({
    status: 404,
    description: 'File tidak ditemukan',
  })
  @ApiResponse({
    status: 500,
    description: 'LibreOffice tidak terinstall atau error konversi',
  })
  async konversiDocxKePdfDariUrl(
    @Body('fileUrl') fileUrl: string,
    @PenggunaSaatIni('id') idPengguna: string,
  ) {
    if (!fileUrl) {
      throw new BadRequestException('fileUrl harus diisi');
    }
    const result = await this.uploadService.konversiDocxKePdfDariUrl(fileUrl, idPengguna);
    return {
      sukses: true,
      pesan: 'File berhasil dikonversi ke PDF',
      data: result,
    };
  }
}
