import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  BuatPesananTerbitDto,
  SpesifikasiBukuDto,
  KelengkapanNaskahDto,
  UpdateStatusPesananDto,
  FilterPesananDto,
} from './dto/pesanan-terbit.dto';
import { StatusPenerbitan, StatusPembayaranTerbit } from '@prisma/client';

/**
 * Service untuk mengelola pesanan penerbitan buku
 */
@Injectable()
export class PesananTerbitService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate nomor pesanan unik
   */
  private generateNomorPesanan(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PUB-${timestamp}-${random}`;
  }

  /**
   * Buat pesanan terbit baru
   */
  async buatPesanan(idPenulis: string, dto: BuatPesananTerbitDto) {
    // Validasi naskah milik penulis
    const naskah = await this.prisma.naskah.findFirst({
      where: {
        id: dto.idNaskah,
        idPenulis,
      },
    });

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan atau bukan milik Anda');
    }

    // Validasi paket aktif
    const paket = await this.prisma.paketPenerbitan.findFirst({
      where: {
        id: dto.idPaket,
        aktif: true,
      },
    });

    if (!paket) {
      throw new NotFoundException('Paket penerbitan tidak ditemukan atau tidak aktif');
    }

    // Validasi jumlah buku minimum
    if (dto.jumlahBuku < paket.jumlahBukuMin) {
      throw new BadRequestException(
        `Jumlah buku minimum untuk paket ini adalah ${paket.jumlahBukuMin} buku`,
      );
    }

    // Hitung total harga
    const totalHarga = Number(paket.harga) * dto.jumlahBuku;

    // Buat pesanan dengan transaction
    const pesanan = await this.prisma.$transaction(async (prisma) => {
      const pesananBaru = await prisma.pesananTerbit.create({
        data: {
          nomorPesanan: this.generateNomorPesanan(),
          idPenulis,
          idNaskah: dto.idNaskah,
          idPaket: dto.idPaket,
          jumlahBuku: dto.jumlahBuku,
          totalHarga,
          revisiMaksimal: paket.revisiMaksimal,
          statusProofreading: paket.termasukProofreading ? 'belum_mulai' : 'tidak_termasuk',
          catatanPenulis: dto.catatanPenulis,
        },
        include: {
          naskah: { select: { judul: true } },
          paket: { select: { nama: true } },
        },
      });

      // Buat spesifikasi buku default
      await prisma.spesifikasiBuku.create({
        data: {
          idPesananTerbit: pesananBaru.id,
        },
      });

      // Buat kelengkapan naskah default
      await prisma.kelengkapanNaskah.create({
        data: {
          idPesananTerbit: pesananBaru.id,
        },
      });

      // Log proses
      await prisma.logProsesTerbit.create({
        data: {
          idPesananTerbit: pesananBaru.id,
          statusBaru: 'draft',
          catatan: 'Pesanan baru dibuat',
          dibuatOleh: idPenulis,
        },
      });

      return pesananBaru;
    });

    return {
      sukses: true,
      pesan: 'Pesanan penerbitan berhasil dibuat',
      data: pesanan,
    };
  }

  /**
   * Ambil daftar pesanan penulis
   */
  async ambilPesananPenulis(idPenulis: string, filter: FilterPesananDto) {
    const { halaman = 1, limit = 10, status, statusPembayaran } = filter;
    const skip = (halaman - 1) * limit;

    const where: Record<string, unknown> = { idPenulis };
    if (status) where.status = status as StatusPenerbitan;
    if (statusPembayaran) where.statusPembayaran = statusPembayaran as StatusPembayaranTerbit;

    const [pesanan, total] = await Promise.all([
      this.prisma.pesananTerbit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggalPesan: 'desc' },
        include: {
          naskah: { select: { id: true, judul: true, urlSampul: true } },
          paket: { select: { nama: true, harga: true } },
          spesifikasi: true,
          kelengkapan: true,
        },
      }),
      this.prisma.pesananTerbit.count({ where }),
    ]);

    return {
      sukses: true,
      data: pesanan,
      metadata: {
        total,
        halaman,
        limit,
        totalHalaman: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Ambil detail pesanan
   */
  async ambilDetailPesanan(id: string, idPenulis?: string) {
    const where: Record<string, unknown> = { id };
    if (idPenulis) where.idPenulis = idPenulis;

    const pesanan = await this.prisma.pesananTerbit.findFirst({
      where,
      include: {
        naskah: {
          select: {
            id: true,
            judul: true,
            subJudul: true,
            sinopsis: true,
            urlSampul: true,
            urlFile: true,
            jumlahHalaman: true,
          },
        },
        paket: true,
        penulis: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: { namaDepan: true, namaBelakang: true },
            },
          },
        },
        spesifikasi: true,
        kelengkapan: true,
        logProsesTerbit: {
          orderBy: { dibuatPada: 'desc' },
          take: 20,
        },
      },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    return {
      sukses: true,
      data: pesanan,
    };
  }

  /**
   * Update spesifikasi buku
   */
  async updateSpesifikasi(idPesanan: string, idPenulis: string, dto: SpesifikasiBukuDto) {
    // Validasi pesanan milik penulis
    const pesanan = await this.prisma.pesananTerbit.findFirst({
      where: {
        id: idPesanan,
        idPenulis,
        status: { in: ['draft', 'menunggu_pembayaran', 'pembayaran_dikonfirmasi'] },
      },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan atau tidak dapat diubah');
    }

    const spesifikasi = await this.prisma.spesifikasiBuku.update({
      where: { idPesananTerbit: idPesanan },
      data: dto,
    });

    return {
      sukses: true,
      pesan: 'Spesifikasi buku berhasil diperbarui',
      data: spesifikasi,
    };
  }

  /**
   * Update kelengkapan naskah
   */
  async updateKelengkapan(idPesanan: string, idPenulis: string, dto: KelengkapanNaskahDto) {
    // Validasi pesanan milik penulis
    const pesanan = await this.prisma.pesananTerbit.findFirst({
      where: {
        id: idPesanan,
        idPenulis,
      },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    const kelengkapan = await this.prisma.kelengkapanNaskah.update({
      where: { idPesananTerbit: idPesanan },
      data: dto,
    });

    return {
      sukses: true,
      pesan: 'Kelengkapan naskah berhasil diperbarui',
      data: kelengkapan,
    };
  }

  /**
   * Update status pesanan (admin/editor)
   */
  async updateStatus(idPesanan: string, idUser: string, dto: UpdateStatusPesananDto) {
    const pesanan = await this.prisma.pesananTerbit.findUnique({
      where: { id: idPesanan },
    });

    if (!pesanan) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    const statusLama = pesanan.status;

    // Update pesanan
    const pesananUpdated = await this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.pesananTerbit.update({
        where: { id: idPesanan },
        data: {
          status: dto.status as StatusPenerbitan,
          tanggalMulaiProses:
            statusLama === 'pembayaran_dikonfirmasi' && dto.status === 'naskah_dikirim'
              ? new Date()
              : undefined,
          tanggalSelesai: dto.status === 'diterbitkan' ? new Date() : undefined,
        },
      });

      // Log perubahan status
      await prisma.logProsesTerbit.create({
        data: {
          idPesananTerbit: idPesanan,
          statusSebelumnya: statusLama,
          statusBaru: dto.status,
          catatan: dto.catatan,
          dibuatOleh: idUser,
        },
      });

      return updated;
    });

    return {
      sukses: true,
      pesan: 'Status pesanan berhasil diperbarui',
      data: pesananUpdated,
    };
  }

  /**
   * Ambil semua pesanan (admin)
   */
  async ambilSemuaPesanan(filter: FilterPesananDto) {
    const { halaman = 1, limit = 10, status, statusPembayaran } = filter;
    const skip = (halaman - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status as StatusPenerbitan;
    if (statusPembayaran) where.statusPembayaran = statusPembayaran as StatusPembayaranTerbit;

    const [pesanan, total] = await Promise.all([
      this.prisma.pesananTerbit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggalPesan: 'desc' },
        include: {
          naskah: { select: { id: true, judul: true } },
          paket: { select: { nama: true } },
          penulis: {
            select: {
              id: true,
              email: true,
              profilPengguna: { select: { namaDepan: true, namaBelakang: true } },
            },
          },
        },
      }),
      this.prisma.pesananTerbit.count({ where }),
    ]);

    return {
      sukses: true,
      data: pesanan,
      metadata: {
        total,
        halaman,
        limit,
        totalHalaman: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Upload bukti pembayaran (transfer)
   */
  async uploadBuktiPembayaran(idPesanan: string, idPenulis: string, file: Express.Multer.File) {
    // Validasi pesanan milik penulis dan status menunggu pembayaran
    const pesanan = await this.prisma.pesananTerbit.findFirst({
      where: {
        id: idPesanan,
        idPenulis,
        status: 'menunggu_pembayaran',
      },
    });

    if (!pesanan) {
      throw new NotFoundException(
        'Pesanan tidak ditemukan atau tidak dalam status menunggu pembayaran',
      );
    }

    if (!file) {
      throw new BadRequestException('File bukti pembayaran diperlukan');
    }

    // Untuk saat ini, simpan sebagai base64 atau path
    // Dalam produksi, upload ke Supabase Storage
    const buktiPembayaranUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Update pesanan
    const pesananUpdated = await this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.pesananTerbit.update({
        where: { id: idPesanan },
        data: {
          buktiPembayaran: buktiPembayaranUrl,
          statusPembayaran: 'menunggu_konfirmasi',
        },
      });

      // Log proses
      await prisma.logProsesTerbit.create({
        data: {
          idPesananTerbit: idPesanan,
          statusSebelumnya: pesanan.status,
          statusBaru: pesanan.status,
          catatan: 'Bukti pembayaran telah diunggah',
          dibuatOleh: idPenulis,
        },
      });

      return updated;
    });

    return {
      sukses: true,
      pesan: 'Bukti pembayaran berhasil diunggah',
      data: pesananUpdated,
    };
  }
}
