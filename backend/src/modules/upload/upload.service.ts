/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  UploadFileDto,
  FilterFileDto,
  ProcessImageDto,
  UploadResponseDto,
  UploadMultipleResponseDto,
  UPLOAD_CONFIG,
  TipeFile,
  IMAGE_PRESETS,
} from './dto';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';
// @ts-ignore - libreoffice-convert tidak punya types
import libre from 'libreoffice-convert';
import { promisify } from 'util';

// Promisify libre.convert
const libreConvert = promisify(libre.convert);

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  // Tidak perlu baseUrl lagi - kita simpan relative path saja
  // Frontend akan handle transformasi ke full URL

  constructor(private readonly prisma: PrismaService) {
    this.ensureUploadDirectory();
  }

  /**
   * Generate URL untuk file - sekarang return relative path saja
   * Frontend akan handle transformasi ke full URL berdasarkan environment
   */
  private buildFileUrl(relativePath: string): string {
    // Pastikan path dimulai dengan /
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    // Return relative path saja, bukan full URL
    return cleanPath;
  }

  /**
   * Pastikan direktori upload exists
   */
  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });

      // Buat subdirektori untuk setiap tipe
      for (const tipe of Object.values(TipeFile)) {
        await fs.mkdir(path.join(this.uploadDir, tipe), { recursive: true });
      }
    }
  }

  /**
   * Validasi file berdasarkan tipe
   */
  validateFile(file: Express.Multer.File, tujuan: TipeFile): void {
    const config = UPLOAD_CONFIG[tujuan];

    // Validasi MIME type
    if (!(config.mimeTypes as readonly string[]).includes(file.mimetype)) {
      throw new BadRequestException(`Tipe file tidak valid. ${config.description}`);
    }

    // Validasi ukuran
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(`Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB`);
    }

    // Validasi ekstensi
    const ext = path.extname(file.originalname).toLowerCase();
    if (!(config.extensions as readonly string[]).includes(ext)) {
      throw new BadRequestException(
        `Ekstensi file tidak valid. Ekstensi yang diperbolehkan: ${config.extensions.join(', ')}`,
      );
    }
  }

  /**
   * Generate nama file unik
   */
  private generateUniqueFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const randomString = crypto.randomBytes(8).toString('hex');
    const sanitizedName = nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 50);

    return `${timestamp}_${sanitizedName}_${randomString}${ext}`;
  }

  /**
   * Upload single file
   */
  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
    idPengguna: string,
  ): Promise<UploadResponseDto> {
    // Validasi file
    this.validateFile(file, dto.tujuan);

    // Generate unique filename
    const uniqueFilename = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(this.uploadDir, dto.tujuan, uniqueFilename);
    const relativePath = `/uploads/${dto.tujuan}/${uniqueFilename}`;
    // Simpan relative path saja, bukan full URL dengan localhost
    const fileUrl = this.buildFileUrl(relativePath);

    try {
      // Simpan file ke disk
      await fs.writeFile(filePath, file.buffer);

      // Simpan metadata ke database
      const fileRecord = await this.prisma.file.create({
        data: {
          idPengguna,
          namaFileAsli: file.originalname,
          namaFileSimpan: uniqueFilename,
          ukuran: file.size,
          mimeType: file.mimetype,
          ekstensi: path.extname(file.originalname),
          tujuan: dto.tujuan,
          path: filePath,
          url: fileUrl,  // Sekarang simpan relative path
          idReferensi: dto.idReferensi,
          deskripsi: dto.deskripsi,
        },
      });

      // Log activity
      await this.prisma.logAktivitas.create({
        data: {
          idPengguna,
          jenis: 'upload_file',
          aksi: 'Upload File',
          entitas: 'File',
          idEntitas: fileRecord.id,
          deskripsi: `File "${file.originalname}" diupload (${dto.tujuan})`,
        },
      });

      return {
        id: fileRecord.id,
        namaFileAsli: fileRecord.namaFileAsli,
        namaFileSimpan: fileRecord.namaFileSimpan,
        url: fileRecord.url,
        urlPublik: fileRecord.urlPublik ?? undefined,
        ukuran: fileRecord.ukuran,
        mimeType: fileRecord.mimeType,
        ekstensi: fileRecord.ekstensi,
        tujuan: fileRecord.tujuan,
        path: fileRecord.path,
        diuploadPada: fileRecord.diuploadPada,
      };
    } catch (error) {
      // Cleanup jika ada error
      try {
        await fs.unlink(filePath);
      } catch {}

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException('Gagal mengupload file: ' + errorMessage);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: Express.Multer.File[],
    dto: UploadFileDto,
    idPengguna: string,
  ): Promise<UploadMultipleResponseDto> {
    const berhasil: UploadResponseDto[] = [];
    const gagal: Array<{ namaFile: string; error: string }> = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, dto, idPengguna);
        berhasil.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        gagal.push({
          namaFile: file.originalname,
          error: errorMessage,
        });
      }
    }

    return {
      berhasil,
      gagal,
      totalBerhasil: berhasil.length,
      totalGagal: gagal.length,
    };
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, idPengguna: string, peranPengguna: string[]) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File tidak ditemukan');
    }

    // Validasi akses: hanya owner atau admin
    const isOwner = file.idPengguna === idPengguna;
    const isAdmin = peranPengguna.includes('admin');

    if (!isOwner && !isAdmin) {
      throw new BadRequestException('Anda tidak memiliki akses untuk menghapus file ini');
    }

    try {
      // Hapus file fisik
      await fs.unlink(file.path);
    } catch (error) {
      // File mungkin sudah tidak ada, lanjut hapus database
      console.error('Error deleting physical file:', error);
    }

    // Hapus record dari database
    await this.prisma.file.delete({
      where: { id },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'delete_file',
        aksi: 'Hapus File',
        entitas: 'File',
        idEntitas: id,
        deskripsi: `File "${file.namaFileAsli}" dihapus`,
      },
    });

    return {
      sukses: true,
      pesan: 'File berhasil dihapus',
    };
  }

  /**
   * Get file URL
   */
  async getFileUrl(id: string): Promise<string> {
    const file = await this.prisma.file.findUnique({
      where: { id },
      select: { url: true },
    });

    if (!file) {
      throw new NotFoundException('File tidak ditemukan');
    }

    return file.url;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
      include: {
        pengguna: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
              },
            },
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('File tidak ditemukan');
    }

    return {
      sukses: true,
      data: file,
    };
  }

  /**
   * List files dengan pagination dan filter
   */
  async listFiles(filter: FilterFileDto, idPengguna?: string) {
    const {
      halaman = 1,
      limit = 20,
      tujuan,
      idPengguna: filterIdPengguna,
      idReferensi,
      mimeType,
      cari,
      urutkan = 'diuploadPada',
      arah = 'desc',
    } = filter;

    const skip = (halaman - 1) * limit;

    // Build where clause
    const where: any = {};

    if (tujuan) {
      where.tujuan = tujuan;
    }

    if (filterIdPengguna) {
      where.idPengguna = filterIdPengguna;
    }

    if (idReferensi) {
      where.idReferensi = idReferensi;
    }

    if (mimeType) {
      where.mimeType = mimeType;
    }

    if (cari) {
      where.OR = [
        { namaFileAsli: { contains: cari, mode: 'insensitive' } },
        { deskripsi: { contains: cari, mode: 'insensitive' } },
      ];
    }

    // Execute query
    const [data, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [urutkan]: arah },
        include: {
          pengguna: {
            select: {
              id: true,
              email: true,
              profilPengguna: {
                select: {
                  namaDepan: true,
                  namaBelakang: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.file.count({ where }),
    ]);

    return {
      sukses: true,
      pesan: 'Data file berhasil diambil',
      data,
      metadata: {
        total,
        halaman,
        limit,
        totalHalaman: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Process image (resize/compress)
   */
  async processImage(
    id: string,
    dto: ProcessImageDto,
    idPengguna: string,
  ): Promise<UploadResponseDto> {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File tidak ditemukan');
    }

    // Validasi: hanya bisa proses image
    if (!file.mimeType.startsWith('image/')) {
      throw new BadRequestException('Hanya file gambar yang bisa diproses');
    }

    // Validasi akses
    if (file.idPengguna !== idPengguna) {
      throw new BadRequestException('Anda tidak memiliki akses ke file ini');
    }

    try {
      // Baca file asli
      const imageBuffer = await fs.readFile(file.path);

      // Setup sharp processor
      let sharpInstance = sharp(imageBuffer);

      // Apply resize jika ada
      if (dto.lebar || dto.tinggi) {
        sharpInstance = sharpInstance.resize({
          width: dto.lebar,
          height: dto.tinggi,
          fit: dto.fit as any,
          withoutEnlargement: dto.pertahankanAspekRasio,
        });
      }

      // Apply format conversion jika ada
      if (dto.format) {
        sharpInstance = sharpInstance.toFormat(dto.format, {
          quality: dto.kualitas,
        });
      } else {
        // Compress dengan format asli
        sharpInstance = sharpInstance.jpeg({ quality: dto.kualitas });
      }

      // Process image
      const processedBuffer = await sharpInstance.toBuffer();

      // Generate new filename
      const ext = dto.format ? `.${dto.format}` : file.ekstensi;
      const nameWithoutExt = path.basename(file.namaFileSimpan, file.ekstensi);
      const processedFilename = `${nameWithoutExt}_processed${ext}`;
      const processedPath = path.join(this.uploadDir, file.tujuan, processedFilename);
      const processedRelativePath = `/uploads/${file.tujuan}/${processedFilename}`;
      const processedUrl = this.buildFileUrl(processedRelativePath);

      // Save processed image
      await fs.writeFile(processedPath, processedBuffer);

      // Create new file record
      const newFile = await this.prisma.file.create({
        data: {
          idPengguna: file.idPengguna,
          namaFileAsli: `${path.basename(file.namaFileAsli, file.ekstensi)}_processed${ext}`,
          namaFileSimpan: processedFilename,
          ukuran: processedBuffer.length,
          mimeType: dto.format ? `image/${dto.format}` : file.mimeType,
          ekstensi: ext,
          tujuan: file.tujuan,
          path: processedPath,
          url: processedUrl,
          idReferensi: file.idReferensi,
          deskripsi: `Processed version of ${file.namaFileAsli}`,
        },
      });

      // Log activity
      await this.prisma.logAktivitas.create({
        data: {
          idPengguna,
          jenis: 'process_image',
          aksi: 'Proses Gambar',
          entitas: 'File',
          idEntitas: newFile.id,
          deskripsi: `Gambar "${file.namaFileAsli}" diproses`,
        },
      });

      return {
        id: newFile.id,
        namaFileAsli: newFile.namaFileAsli,
        namaFileSimpan: newFile.namaFileSimpan,
        url: newFile.url,
        urlPublik: newFile.urlPublik ?? undefined,
        ukuran: newFile.ukuran,
        mimeType: newFile.mimeType,
        ekstensi: newFile.ekstensi,
        tujuan: newFile.tujuan,
        path: newFile.path,
        diuploadPada: newFile.diuploadPada,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException('Gagal memproses gambar: ' + errorMessage);
    }
  }

  /**
   * Process image dengan preset (thumbnail, sampul, dll)
   */
  async processImageWithPreset(
    id: string,
    preset: keyof typeof IMAGE_PRESETS,
    idPengguna: string,
  ): Promise<UploadResponseDto> {
    const presetConfig = IMAGE_PRESETS[preset];
    return this.processImage(
      id,
      {
        ...presetConfig,
        pertahankanAspekRasio: presetConfig.pertahankanAspekRasio ?? true,
      },
      idPengguna,
    );
  }

  /**
   * Konversi file DOCX ke PDF menggunakan LibreOffice
   */
  async konversiDocxKePdf(
    id: string,
    idPengguna: string,
  ): Promise<UploadResponseDto> {
    // Ambil data file dari database
    const file = await this.prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File tidak ditemukan');
    }

    // Validasi ekstensi file
    const ext = file.ekstensi.toLowerCase();
    if (ext !== '.docx' && ext !== '.doc') {
      throw new BadRequestException('File harus berformat DOCX atau DOC untuk dikonversi ke PDF');
    }

    // Cek apakah file fisik exists
    try {
      await fs.access(file.path);
    } catch {
      throw new NotFoundException('File fisik tidak ditemukan di server');
    }

    try {
      // Baca file DOCX
      const docxBuffer = await fs.readFile(file.path);
      
      // Konversi ke PDF menggunakan LibreOffice
      const pdfBuffer = await libreConvert(docxBuffer, '.pdf', undefined);
      
      // Generate nama file PDF baru
      const pdfFilename = file.namaFileSimpan.replace(/\.(docx|doc)$/i, '.pdf');
      const pdfPath = path.join(this.uploadDir, file.tujuan, pdfFilename);
      const pdfRelativePath = `/uploads/${file.tujuan}/${pdfFilename}`;
      const pdfUrl = this.buildFileUrl(pdfRelativePath);
      
      // Simpan file PDF
      await fs.writeFile(pdfPath, pdfBuffer);
      
      // Simpan metadata ke database
      const pdfRecord = await this.prisma.file.create({
        data: {
          idPengguna,
          namaFileAsli: file.namaFileAsli.replace(/\.(docx|doc)$/i, '.pdf'),
          namaFileSimpan: pdfFilename,
          ukuran: pdfBuffer.length,
          mimeType: 'application/pdf',
          ekstensi: '.pdf',
          tujuan: file.tujuan,
          path: pdfPath,
          url: pdfUrl,
          idReferensi: file.idReferensi,
          deskripsi: `Hasil konversi dari ${file.namaFileAsli}`,
        },
      });

      // Log activity
      await this.prisma.logAktivitas.create({
        data: {
          idPengguna,
          jenis: 'konversi_pdf',
          aksi: 'Konversi DOCX ke PDF',
          entitas: 'File',
          idEntitas: pdfRecord.id,
          deskripsi: `File "${file.namaFileAsli}" berhasil dikonversi ke PDF`,
        },
      });

      return {
        id: pdfRecord.id,
        namaFileAsli: pdfRecord.namaFileAsli,
        namaFileSimpan: pdfRecord.namaFileSimpan,
        url: pdfRecord.url,
        urlPublik: pdfRecord.urlPublik ?? undefined,
        ukuran: pdfRecord.ukuran,
        mimeType: pdfRecord.mimeType,
        ekstensi: pdfRecord.ekstensi,
        tujuan: pdfRecord.tujuan,
        path: pdfRecord.path,
        diuploadPada: pdfRecord.diuploadPada,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Cek jika LibreOffice tidak terinstall
      if (errorMessage.includes('soffice') || errorMessage.includes('libreoffice')) {
        throw new InternalServerErrorException(
          'LibreOffice tidak terinstall di server. Silakan install LibreOffice untuk menggunakan fitur konversi PDF otomatis, atau upload file PDF manual.'
        );
      }
      
      throw new InternalServerErrorException('Gagal mengkonversi file ke PDF: ' + errorMessage);
    }
  }

  /**
   * Konversi file DOCX ke PDF dari URL (untuk file yang belum ada di database)
   */
  async konversiDocxKePdfDariUrl(
    fileUrl: string,
    idPengguna: string,
  ): Promise<UploadResponseDto> {
    // Parse URL untuk mendapatkan path file
    // Support berbagai format URL:
    // - http://localhost:4000/uploads/naskah/filename.docx (full URL)
    // - /uploads/naskah/filename.docx (relative URL)
    // - uploads/naskah/filename.docx (path only)
    
    let urlPath = fileUrl;
    
    // Remove full URL prefix jika ada (http://host:port)
    const urlMatch = fileUrl.match(/^https?:\/\/[^\/]+(.+)$/);
    if (urlMatch) {
      urlPath = urlMatch[1]; // /uploads/naskah/filename.docx
    }
    
    // Remove /uploads/ prefix
    urlPath = urlPath.replace(/^\/uploads\//, '').replace(/^uploads\//, '');
    
    const filePath = path.join(this.uploadDir, urlPath);
    
    // Cek apakah file fisik exists
    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundException('File fisik tidak ditemukan di server: ' + filePath);
    }

    // Validasi ekstensi file
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.docx' && ext !== '.doc') {
      throw new BadRequestException('File harus berformat DOCX atau DOC untuk dikonversi ke PDF');
    }

    const originalFilename = path.basename(filePath);
    const tujuan = urlPath.split('/')[0] as TipeFile; // naskah, dokumen, etc

    try {
      // Baca file DOCX
      const docxBuffer = await fs.readFile(filePath);
      
      // Konversi ke PDF menggunakan LibreOffice
      const pdfBuffer = await libreConvert(docxBuffer, '.pdf', undefined);
      
      // Generate nama file PDF baru
      const pdfFilename = originalFilename.replace(/\.(docx|doc)$/i, '.pdf');
      const pdfPath = path.join(this.uploadDir, tujuan, pdfFilename);
      const pdfRelativePath = `/uploads/${tujuan}/${pdfFilename}`;
      const pdfUrl = this.buildFileUrl(pdfRelativePath);
      
      // Simpan file PDF
      await fs.writeFile(pdfPath, pdfBuffer);
      
      // Simpan metadata ke database
      const pdfRecord = await this.prisma.file.create({
        data: {
          idPengguna,
          namaFileAsli: originalFilename.replace(/\.(docx|doc)$/i, '.pdf'),
          namaFileSimpan: pdfFilename,
          ukuran: pdfBuffer.length,
          mimeType: 'application/pdf',
          ekstensi: '.pdf',
          tujuan: tujuan,
          path: pdfPath,
          url: pdfUrl,
          deskripsi: `Hasil konversi dari ${originalFilename}`,
        },
      });

      // Log activity
      await this.prisma.logAktivitas.create({
        data: {
          idPengguna,
          jenis: 'konversi_pdf',
          aksi: 'Konversi DOCX ke PDF',
          entitas: 'File',
          idEntitas: pdfRecord.id,
          deskripsi: `File "${originalFilename}" berhasil dikonversi ke PDF`,
        },
      });

      return {
        id: pdfRecord.id,
        namaFileAsli: pdfRecord.namaFileAsli,
        namaFileSimpan: pdfRecord.namaFileSimpan,
        url: pdfRecord.url,
        urlPublik: pdfRecord.urlPublik ?? undefined,
        ukuran: pdfRecord.ukuran,
        mimeType: pdfRecord.mimeType,
        ekstensi: pdfRecord.ekstensi,
        tujuan: pdfRecord.tujuan,
        path: pdfRecord.path,
        diuploadPada: pdfRecord.diuploadPada,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Cek jika LibreOffice tidak terinstall
      if (errorMessage.includes('soffice') || errorMessage.includes('libreoffice')) {
        throw new InternalServerErrorException(
          'LibreOffice tidak terinstall di server. Silakan install LibreOffice untuk menggunakan fitur konversi PDF otomatis, atau upload file PDF manual.'
        );
      }
      
      throw new InternalServerErrorException('Gagal mengkonversi file ke PDF: ' + errorMessage);
    }
  }
}
