/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BuatPenggunaDto,
  PerbaruiPenggunaDto,
  PerbaruiProfilDto,
  FilterPenggunaDto,
  GantiPasswordDto,
} from './dto';
import { hashPassword, verifyPassword } from '@/utils/hash.util';
import { JenisPeran } from '@prisma/client';

@Injectable()
export class PenggunaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ambil semua pengguna dengan pagination dan filter
   * Role: admin
   */
  async ambilSemuaPengguna(filter: FilterPenggunaDto) {
    const {
      halaman = 1,
      limit = 20,
      cari,
      peran,
      aktif,
      terverifikasi,
      urutkan = 'dibuatPada',
      arah = 'desc',
    } = filter;

    const skip = (halaman - 1) * limit;

    // Build where clause dynamically
    const where: any = {};

    // Search filter (email, namaDepan, namaBelakang)
    if (cari) {
      where.OR = [
        { email: { contains: cari, mode: 'insensitive' } },
        {
          profilPengguna: {
            OR: [
              { namaDepan: { contains: cari, mode: 'insensitive' } },
              { namaBelakang: { contains: cari, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    // Status filters
    if (aktif !== undefined) {
      where.aktif = aktif;
    }

    if (terverifikasi !== undefined) {
      where.terverifikasi = terverifikasi;
    }

    // Role filter
    if (peran) {
      where.peranPengguna = {
        some: {
          jenisPeran: peran as JenisPeran,
          aktif: true,
        },
      };
    }

    // Execute query with pagination
    const [data, total] = await Promise.all([
      this.prisma.pengguna.findMany({
        where,
        skip,
        take: limit,
        orderBy:
          urutkan === 'namaDepan' ? { profilPengguna: { namaDepan: arah } } : { [urutkan]: arah },
        select: {
          id: true,
          email: true,
          telepon: true,
          aktif: true,
          terverifikasi: true,
          loginTerakhir: true,
          dibuatPada: true,
          profilPengguna: {
            select: {
              namaDepan: true,
              namaBelakang: true,
              namaTampilan: true,
              urlAvatar: true,
            },
          },
          peranPengguna: {
            where: { aktif: true },
            select: {
              jenisPeran: true,
            },
          },
        },
      }),
      this.prisma.pengguna.count({ where }),
    ]);

    return {
      sukses: true,
      pesan: 'Data pengguna berhasil diambil',
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
   * Ambil detail pengguna by ID
   * Role: admin, atau user sendiri
   */
  async ambilPenggunaById(id: string) {
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        telepon: true,
        aktif: true,
        terverifikasi: true,
        emailDiverifikasiPada: true,
        loginTerakhir: true,
        dibuatPada: true,
        diperbaruiPada: true,
        profilPengguna: {
          select: {
            id: true,
            namaDepan: true,
            namaBelakang: true,
            namaTampilan: true,
            bio: true,
            urlAvatar: true,
            tanggalLahir: true,
            jenisKelamin: true,
            alamat: true,
            kota: true,
            provinsi: true,
            kodePos: true,
          },
        },
        peranPengguna: {
          where: { aktif: true },
          select: {
            id: true,
            jenisPeran: true,
            ditugaskanPada: true,
          },
        },
        profilPenulis: {
          select: {
            id: true,
            namaPena: true,
            biografi: true,
            spesialisasi: true,
            totalBuku: true,
            totalDibaca: true,
            ratingRataRata: true,
          },
        },
      },
    });

    if (!pengguna) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    return {
      sukses: true,
      data: pengguna,
    };
  }

  /**
   * Perbarui pengguna (Admin only)
   */
  async perbaruiPengguna(id: string, dto: PerbaruiPenggunaDto) {
    // Check if user exists
    await this.ambilPenggunaById(id);

    // If email is being changed, check uniqueness
    if (dto.email) {
      const existingUser = await this.prisma.pengguna.findUnique({
        where: { email: dto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email sudah digunakan oleh pengguna lain');
      }
    }

    // Separate profile fields from user fields
    const { namaDepan, namaBelakang, ...userFields } = dto;

    const penggunaUpdated = await this.prisma.$transaction(async (prisma) => {
      // Update user table
      const pengguna = await prisma.pengguna.update({
        where: { id },
        data: userFields,
      });

      // Update profile if profile fields present
      if (namaDepan !== undefined || namaBelakang !== undefined) {
        await prisma.profilPengguna.update({
          where: { idPengguna: id },
          data: {
            namaDepan,
            namaBelakang,
          },
        });
      }

      return pengguna;
    });

    return {
      sukses: true,
      pesan: 'Data pengguna berhasil diperbarui',
      data: await this.ambilPenggunaById(penggunaUpdated.id),
    };
  }

  /**
   * Perbarui profil pengguna sendiri
   */
  async perbaruiProfil(idPengguna: string, dto: PerbaruiProfilDto) {
    // Check if user exists
    await this.ambilPenggunaById(idPengguna);

    // Separate user fields (telepon) from profile fields
    const { telepon, ...profilFields } = dto;

    await this.prisma.$transaction(async (prisma) => {
      // Update telepon in user table if provided
      if (telepon !== undefined) {
        await prisma.pengguna.update({
          where: { id: idPengguna },
          data: { telepon },
        });
      }

      // Update profile
      await prisma.profilPengguna.update({
        where: { idPengguna },
        data: {
          ...profilFields,
          tanggalLahir: dto.tanggalLahir ? new Date(dto.tanggalLahir) : undefined,
        },
      });
    });

    return {
      sukses: true,
      pesan: 'Profil berhasil diperbarui',
      data: await this.ambilPenggunaById(idPengguna),
    };
  }

  /**
   * Ganti password pengguna
   */
  async gantiPassword(idPengguna: string, dto: GantiPasswordDto) {
    // Get user with password
    const pengguna = await this.prisma.pengguna.findUnique({
      where: { id: idPengguna },
      select: {
        id: true,
        email: true,
        kataSandi: true,
      },
    });

    if (!pengguna) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }

    // Check apakah user punya password (user OAuth-only tidak punya password)
    if (!pengguna.kataSandi) {
      throw new BadRequestException(
        'Akun ini terdaftar melalui OAuth. Tidak bisa mengubah password.',
      );
    }

    // Verify old password
    const isPasswordValid = await verifyPassword(dto.kataSandiLama, pengguna.kataSandi);

    if (!isPasswordValid) {
      throw new BadRequestException('Kata sandi lama tidak valid');
    }

    // Hash new password
    const hashedPassword = await hashPassword(dto.kataSandiBaru);

    // Update password
    await this.prisma.pengguna.update({
      where: { id: idPengguna },
      data: {
        kataSandi: hashedPassword,
      },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'ganti_password',
        aksi: 'Ganti Password',
        entitas: 'Pengguna',
        idEntitas: idPengguna,
        deskripsi: `Pengguna ${pengguna.email} berhasil mengganti password`,
      },
    });

    return {
      sukses: true,
      pesan: 'Password berhasil diperbarui',
    };
  }

  /**
   * Hapus pengguna (Soft delete)
   */
  async hapusPengguna(id: string) {
    // Check if user exists
    await this.ambilPenggunaById(id);

    // Soft delete: set aktif = false
    await this.prisma.pengguna.update({
      where: { id },
      data: {
        aktif: false,
      },
    });

    // Log activity (idPengguna null karena admin yang menghapus)
    await this.prisma.logAktivitas.create({
      data: {
        jenis: 'hapus_pengguna',
        aksi: 'Hapus Pengguna',
        entitas: 'Pengguna',
        idEntitas: id,
        deskripsi: `Pengguna dengan ID ${id} berhasil dihapus (soft delete)`,
      },
    });

    return {
      sukses: true,
      pesan: 'Pengguna berhasil dihapus',
    };
  }

  /**
   * Ambil statistik pengguna
   * Role: admin
   */
  async ambilStatistikPengguna() {
    const [totalPengguna, penggunaAktif, penggunaTerverifikasi, totalPerPeran] = await Promise.all([
      // Total users
      this.prisma.pengguna.count(),

      // Active users
      this.prisma.pengguna.count({
        where: { aktif: true },
      }),

      // Verified users
      this.prisma.pengguna.count({
        where: { terverifikasi: true },
      }),

      // Count by role
      this.prisma.peranPengguna.groupBy({
        by: ['jenisPeran'],
        where: { aktif: true },
        _count: {
          jenisPeran: true,
        },
      }),
    ]);

    // Transform role counts to object
    const perPeran = totalPerPeran.reduce(
      (acc, item) => {
        acc[item.jenisPeran] = item._count.jenisPeran;
        return acc;
      },
      {
        penulis: 0,
        editor: 0,
        admin: 0,
      } as Record<JenisPeran, number>,
    );

    return {
      sukses: true,
      data: {
        totalPengguna,
        penggunaAktif,
        penggunaTerverifikasi,
        perPeran,
      },
    };
  }
}
