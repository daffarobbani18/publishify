import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BuatPaketDto, PerbaruiPaketDto } from './dto/paket.dto';

/**
 * Service untuk mengelola paket penerbitan
 */
@Injectable()
export class PaketService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ambil semua paket penerbitan yang aktif
   */
  async ambilSemuaPaket(termasukTidakAktif = false) {
    const where = termasukTidakAktif ? {} : { aktif: true };

    const paket = await this.prisma.paketPenerbitan.findMany({
      where,
      orderBy: { urutan: 'asc' },
    });

    return {
      sukses: true,
      pesan: 'Daftar paket penerbitan berhasil diambil',
      data: paket,
      total: paket.length,
    };
  }

  /**
   * Ambil detail paket berdasarkan ID
   */
  async ambilPaketById(id: string) {
    const paket = await this.prisma.paketPenerbitan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pesananTerbit: true },
        },
      },
    });

    if (!paket) {
      throw new NotFoundException('Paket penerbitan tidak ditemukan');
    }

    return {
      sukses: true,
      data: paket,
    };
  }

  /**
   * Buat paket penerbitan baru (admin only)
   */
  async buatPaket(dto: BuatPaketDto) {
    const paket = await this.prisma.paketPenerbitan.create({
      data: {
        kode: dto.kode,
        nama: dto.nama,
        deskripsi: dto.deskripsi,
        harga: dto.harga,
        jumlahBukuMin: dto.jumlahBukuMin,
        termasukProofreading: dto.termasukProofreading ?? false,
        termasukLayoutDesain: dto.termasukLayoutDesain ?? true,
        termasukISBN: dto.termasukISBN ?? true,
        termasukEbook: dto.termasukEbook ?? false,
        revisiMaksimal: dto.revisiMaksimal ?? 2,
        fiturTambahan: dto.fiturTambahan ?? [],
        urutan: dto.urutan ?? 0,
      },
    });

    return {
      sukses: true,
      pesan: 'Paket penerbitan berhasil dibuat',
      data: paket,
    };
  }

  /**
   * Perbarui paket penerbitan (admin only)
   */
  async perbaruiPaket(id: string, dto: PerbaruiPaketDto) {
    await this.ambilPaketById(id);

    const paket = await this.prisma.paketPenerbitan.update({
      where: { id },
      data: dto,
    });

    return {
      sukses: true,
      pesan: 'Paket penerbitan berhasil diperbarui',
      data: paket,
    };
  }

  /**
   * Hapus paket penerbitan (soft delete - nonaktifkan)
   */
  async hapusPaket(id: string) {
    await this.ambilPaketById(id);

    await this.prisma.paketPenerbitan.update({
      where: { id },
      data: { aktif: false },
    });

    return {
      sukses: true,
      pesan: 'Paket penerbitan berhasil dinonaktifkan',
    };
  }
}
