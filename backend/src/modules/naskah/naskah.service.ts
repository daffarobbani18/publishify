/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BuatNaskahDto,
  PerbaruiNaskahDto,
  FilterNaskahDto,
  AjukanNaskahDto,
  TerbitkanNaskahDto,
  SubmitRevisiDto,
} from './dto';
import { StatusNaskah, StatusReview, Rekomendasi } from '@prisma/client';
import {
  CursorPaginationDto,
  buildCursorPaginationResponse,
} from '@/common/dto/cursor-pagination.dto';
import { EmailService } from '@/modules/notifikasi/email.service';
import { NotifikasiService } from '@/modules/notifikasi/notifikasi.service';
import { UploadService } from '@/modules/upload/upload.service';

@Injectable()
export class NaskahService {
  private readonly logger = new Logger(NaskahService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly notifikasiService: NotifikasiService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Buat naskah baru
   * Role: penulis
   * Mendukung input via:
   * 1. URL file langsung (upload file terlebih dahulu)
   * 2. Konten HTML dari rich text editor (akan dikonversi ke DOCX)
   */
  async buatNaskah(idPenulis: string, dto: BuatNaskahDto) {
    // Validasi kategori exists
    const kategori = await this.prisma.kategori.findUnique({
      where: { id: dto.idKategori },
    });

    if (!kategori || !kategori.aktif) {
      throw new BadRequestException('Kategori tidak valid atau tidak aktif');
    }

    // Validasi genre exists
    const genre = await this.prisma.genre.findUnique({
      where: { id: dto.idGenre },
    });

    if (!genre || !genre.aktif) {
      throw new BadRequestException('Genre tidak valid atau tidak aktif');
    }

    // Proses konten HTML ke DOCX jika ada konten dari editor
    let urlFile = dto.urlFile || null;
    if (dto.konten && !dto.urlFile) {
      try {
        this.logger.log(`Mengkonversi konten HTML ke DOCX untuk naskah baru: ${dto.judul}`);

        const hasilKonversi = await this.uploadService.konversiHtmlKeDocx(
          dto.konten,
          dto.judul,
          idPenulis,
        );

        urlFile = hasilKonversi.url;
        this.logger.log(`Berhasil konversi ke DOCX: ${urlFile}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Gagal konversi HTML ke DOCX: ${errorMsg}`);
        throw new BadRequestException('Gagal menyimpan konten naskah: ' + errorMsg);
      }
    }

    // Siapkan data untuk create (hapus field konten karena tidak ada di schema database)
    const { konten, ...dataCreate } = dto;

    // Buat naskah dengan revisi pertama
    const naskah = await this.prisma.$transaction(async (prisma) => {
      // Create naskah
      const newNaskah = await prisma.naskah.create({
        data: {
          ...dataCreate,
          urlFile, // Gunakan urlFile yang sudah diproses
          idPenulis,
          status: StatusNaskah.draft,
        },
        include: {
          penulis: {
            select: {
              id: true,
              email: true,
              profilPengguna: {
                select: {
                  namaDepan: true,
                  namaBelakang: true,
                  namaTampilan: true,
                },
              },
            },
          },
          kategori: true,
          genre: true,
        },
      });

      // Create revisi pertama jika ada file
      if (urlFile) {
        await prisma.revisiNaskah.create({
          data: {
            idNaskah: newNaskah.id,
            versi: 1,
            catatan: 'Versi awal naskah',
            urlFile: urlFile,
          },
        });
      }

      return newNaskah;
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPenulis,
        jenis: 'buat_naskah',
        aksi: 'Buat Naskah',
        entitas: 'Naskah',
        idEntitas: naskah.id,
        deskripsi: `Naskah "${naskah.judul}" berhasil dibuat`,
      },
    });

    return {
      sukses: true,
      pesan: 'Naskah berhasil dibuat',
      data: naskah,
    };
  }

  /**
   * Ambil semua naskah dengan pagination dan filter
   * Role: public (untuk publik=true), authenticated (semua)
   */
  async ambilSemuaNaskah(filter: FilterNaskahDto, idPengguna?: string) {
    const {
      halaman = 1,
      limit = 20,
      cari,
      status,
      idKategori,
      idGenre,
      idPenulis,
      publik,
      urutkan = 'dibuatPada',
      arah = 'desc',
    } = filter;

    // Convert to number untuk memastikan tipe data yang benar untuk Prisma
    const halamanNumber = Number(halaman);
    const limitNumber = Number(limit);
    const skip = (halamanNumber - 1) * limitNumber;

    // Build where clause
    const where: any = {};

    // Jika tidak ada idPengguna (public), hanya tampilkan yang publik dan diterbitkan
    if (!idPengguna) {
      where.publik = true;
      where.status = StatusNaskah.diterbitkan;
    } else {
      // Authenticated user bisa filter publik
      if (publik !== undefined) {
        where.publik = publik;
      }
    }

    // Search filter (judul, sinopsis)
    if (cari) {
      where.OR = [
        { judul: { contains: cari, mode: 'insensitive' } },
        { sinopsis: { contains: cari, mode: 'insensitive' } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by kategori
    if (idKategori) {
      where.idKategori = idKategori;
    }

    // Filter by genre
    if (idGenre) {
      where.idGenre = idGenre;
    }

    // Filter by penulis
    if (idPenulis) {
      where.idPenulis = idPenulis;
    }

    // Execute query
    const [data, total] = await Promise.all([
      this.prisma.naskah.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { [urutkan]: arah },
        select: {
          id: true,
          judul: true,
          subJudul: true,
          sinopsis: true,
          isbn: true,
          status: true,
          urlSampul: true,
          urlFile: true,
          jumlahHalaman: true,
          jumlahKata: true,
          publik: true,
          dibuatPada: true,
          diperbaruiPada: true,
          penulis: {
            select: {
              id: true,
              email: true,
              profilPengguna: {
                select: {
                  namaDepan: true,
                  namaBelakang: true,
                  namaTampilan: true,
                  urlAvatar: true,
                },
              },
              profilPenulis: {
                select: {
                  namaPena: true,
                  ratingRataRata: true,
                },
              },
            },
          },
          kategori: {
            select: {
              id: true,
              nama: true,
              slug: true,
            },
          },
          genre: {
            select: {
              id: true,
              nama: true,
              slug: true,
            },
          },
          review: {
            select: {
              id: true,
              status: true,
              rekomendasi: true,
              catatan: true,
              ditugaskanPada: true,
              selesaiPada: true,
            },
            orderBy: { ditugaskanPada: 'desc' },
            take: 1, // Ambil review terbaru saja
          },
          _count: {
            select: {
              revisi: true,
              review: true,
            },
          },
        },
      }),
      this.prisma.naskah.count({ where }),
    ]);

    return {
      sukses: true,
      pesan: 'Data naskah berhasil diambil',
      data,
      metadata: {
        total,
        halaman: halamanNumber,
        limit: limitNumber,
        totalHalaman: Math.ceil(total / limitNumber),
      },
    };
  }

  /**
   * Ambil naskah dengan cursor-based pagination
   * Lebih efisien untuk dataset besar dan deep pagination
   * Role: public (untuk publik=true), authenticated (semua)
   */
  async ambilNaskahDenganCursor(
    cursor: string | undefined,
    limit: number = 20,
    status?: StatusNaskah,
    idKategori?: string,
    idPengguna?: string,
  ) {
    const take = Math.min(limit, 100); // Max 100 items

    // Build where clause
    const where: any = {};

    // Jika tidak ada idPengguna (public), hanya tampilkan yang publik dan diterbitkan
    if (!idPengguna) {
      where.publik = true;
      where.status = StatusNaskah.diterbitkan;
    } else {
      // Authenticated user bisa filter status
      if (status) {
        where.status = status;
      }
    }

    // Filter by kategori
    if (idKategori) {
      where.idKategori = idKategori;
    }

    // Fetch items (take + 1 untuk detect hasMore)
    const items = await this.prisma.naskah.findMany({
      where,
      take: take + 1, // Fetch satu lebih untuk detect hasMore
      ...(cursor && {
        cursor: {
          id: cursor, // Gunakan ID sebagai cursor (unique field)
        },
        skip: 1, // Skip cursor item
      }),
      orderBy: {
        dibuatPada: 'desc', // Sort by creation date
      },
      select: {
        id: true,
        judul: true,
        subJudul: true,
        sinopsis: true,
        isbn: true,
        status: true,
        urlSampul: true,
        urlFile: true,
        jumlahHalaman: true,
        jumlahKata: true,
        publik: true,
        dibuatPada: true,
        diperbaruiPada: true,
        penulis: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
                namaTampilan: true,
                urlAvatar: true,
              },
            },
            profilPenulis: {
              select: {
                namaPena: true,
                ratingRataRata: true,
              },
            },
          },
        },
        kategori: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
        genre: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
        _count: {
          select: {
            revisi: true,
            review: true,
          },
        },
      },
    });

    // Build response dengan helper function
    return buildCursorPaginationResponse(items, take, (item) => item.id);
  }

  /**
   * Ambil detail naskah by ID
   */
  async ambilNaskahById(id: string, idPengguna?: string) {
    const naskah = await this.prisma.naskah.findUnique({
      where: { id },
      include: {
        penulis: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
                namaTampilan: true,
                urlAvatar: true,
                bio: true,
              },
            },
            profilPenulis: {
              select: {
                namaPena: true,
                biografi: true,
                spesialisasi: true,
                ratingRataRata: true,
                totalBuku: true,
              },
            },
          },
        },
        kategori: true,
        genre: true,
        revisi: {
          orderBy: { versi: 'desc' },
          take: 10,
        },
        review: {
          where: { status: 'selesai' },
          include: {
            editor: {
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
          orderBy: { ditugaskanPada: 'desc' },
        },
        _count: {
          select: {
            revisi: true,
            review: true,
          },
        },
      },
    });

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    // Validasi akses
    // 1. Jika naskah publik atau sudah diterbitkan, semua bisa akses
    // 2. Jika private/belum diterbitkan, hanya penulis pemilik yang bisa akses
    // 3. Penulis SELALU bisa akses naskah mereka sendiri (termasuk draft, diajukan, dll)
    const isPenulisNaskah = idPengguna && naskah.idPenulis === idPengguna;
    const isPublicAccess = naskah.publik || naskah.status === 'diterbitkan';

    // Jika bukan penulis pemilik DAN bukan public access, tolak
    if (!isPenulisNaskah && !isPublicAccess) {
      throw new ForbiddenException('Anda tidak memiliki akses ke naskah ini');
    }

    return {
      sukses: true,
      data: naskah,
    };
  }

  /**
   * Ambil naskah milik penulis tertentu
   * Role: penulis (naskah sendiri)
   */
  async ambilNaskahPenulis(idPenulis: string, filter: FilterNaskahDto) {
    // Override idPenulis di filter
    return this.ambilSemuaNaskah({ ...filter, idPenulis }, idPenulis);
  }

  /**
   * Ambil naskah yang sudah diterbitkan dan siap cetak
   * Role: penulis
   * Filter: status = 'diterbitkan' (sudah publish)
   */
  async ambilNaskahDiterbitkan(idPenulis: string) {
    const naskah = await this.prisma.naskah.findMany({
      where: {
        idPenulis,
        status: StatusNaskah.diterbitkan,
      },
      include: {
        penulis: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
                namaTampilan: true,
              },
            },
          },
        },
        kategori: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
        genre: {
          select: {
            id: true,
            nama: true,
            slug: true,
          },
        },
        review: {
          where: {
            status: StatusReview.selesai,
            rekomendasi: Rekomendasi.setujui,
          },
          include: {
            editor: {
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
          orderBy: {
            selesaiPada: 'desc',
          },
          take: 1, // Ambil review terakhir saja
        },
      },
      orderBy: {
        diperbaruiPada: 'desc',
      },
    });

    return {
      sukses: true,
      pesan: 'Daftar naskah diterbitkan berhasil diambil',
      data: naskah,
      metadata: {
        total: naskah.length,
      },
    };
  }

  /**
   * Perbarui naskah
   * Role: penulis (owner), editor (untuk review), admin
   */
  async perbaruiNaskah(
    id: string,
    dto: PerbaruiNaskahDto,
    idPengguna: string,
    peranPengguna: string[],
  ) {
    // Check if naskah exists
    const naskahLama = await this.prisma.naskah.findUnique({
      where: { id },
      select: {
        id: true,
        idPenulis: true,
        status: true,
        judul: true,
      },
    });

    if (!naskahLama) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    // Validasi akses: hanya penulis owner atau admin
    const isPenulis = peranPengguna.includes('penulis');
    const isAdmin = peranPengguna.includes('admin');

    if (isPenulis && naskahLama.idPenulis !== idPengguna && !isAdmin) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengubah naskah ini');
    }

    // Cek apakah ini update kelengkapan dokumen siap terbit
    const isUpdateKelengkapan =
      dto.isbn !== undefined ||
      dto.urlSuratPerjanjian !== undefined ||
      dto.urlSuratKeaslian !== undefined ||
      dto.urlProposalNaskah !== undefined ||
      dto.urlBuktiTransfer !== undefined;

    // Field yang boleh diupdate saat status siap_terbit (kelengkapan dokumen)
    const fieldKelengkapan = [
      'isbn',
      'urlSuratPerjanjian',
      'urlSuratKeaslian',
      'urlProposalNaskah',
      'urlBuktiTransfer',
    ];

    // Validasi: tidak bisa edit jika status bukan draft atau ditolak
    // KECUALI: update kelengkapan dokumen saat status siap_terbit
    if (!isAdmin) {
      const statusDapatDiedit =
        naskahLama.status === StatusNaskah.draft || naskahLama.status === StatusNaskah.ditolak;

      const statusSiapTerbit = naskahLama.status === StatusNaskah.siap_terbit;

      if (!statusDapatDiedit) {
        // Jika status siap_terbit, hanya izinkan update kelengkapan dokumen
        if (statusSiapTerbit && isUpdateKelengkapan) {
          // Filter hanya field kelengkapan yang boleh diupdate
          const dtoKeys = Object.keys(dto);
          const hasNonKelengkapanField = dtoKeys.some((key) => !fieldKelengkapan.includes(key));

          if (hasNonKelengkapanField) {
            throw new BadRequestException(
              'Saat status siap terbit, hanya kelengkapan dokumen yang bisa diperbarui (ISBN, surat perjanjian, surat keaslian, proposal, bukti transfer)',
            );
          }
        } else {
          throw new BadRequestException('Naskah hanya bisa diubah saat status draft atau ditolak');
        }
      }
    }

    // Validasi kategori dan genre jika ada update
    if (dto.idKategori) {
      const kategori = await this.prisma.kategori.findUnique({
        where: { id: dto.idKategori },
      });
      if (!kategori || !kategori.aktif) {
        throw new BadRequestException('Kategori tidak valid atau tidak aktif');
      }
    }

    if (dto.idGenre) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: dto.idGenre },
      });
      if (!genre || !genre.aktif) {
        throw new BadRequestException('Genre tidak valid atau tidak aktif');
      }
    }

    // Update naskah
    const naskah = await this.prisma.naskah.update({
      where: { id },
      data: dto,
      include: {
        penulis: {
          select: {
            id: true,
            email: true,
            profilPengguna: true,
          },
        },
        kategori: true,
        genre: true,
      },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'perbarui_naskah',
        aksi: 'Perbarui Naskah',
        entitas: 'Naskah',
        idEntitas: id,
        deskripsi: `Naskah "${naskahLama.judul}" berhasil diperbarui`,
      },
    });

    return {
      sukses: true,
      pesan: 'Naskah berhasil diperbarui',
      data: naskah,
    };
  }

  /**
   * Ajukan naskah untuk review
   * Role: penulis
   */
  async ajukanNaskah(id: string, dto: AjukanNaskahDto, idPenulis: string) {
    const naskah = await this.prisma.naskah.findUnique({
      where: { id },
      select: {
        id: true,
        idPenulis: true,
        status: true,
        judul: true,
        urlFile: true,
      },
    });

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    // Validasi owner
    if (naskah.idPenulis !== idPenulis) {
      throw new ForbiddenException('Anda tidak memiliki akses ke naskah ini');
    }

    // Validasi status: hanya draft atau ditolak yang bisa diajukan
    if (naskah.status !== StatusNaskah.draft && naskah.status !== StatusNaskah.ditolak) {
      throw new BadRequestException('Naskah hanya bisa diajukan saat status draft atau ditolak');
    }

    // Validasi: harus ada file naskah
    if (!naskah.urlFile) {
      throw new BadRequestException('Naskah harus memiliki file sebelum diajukan');
    }

    // Update status menjadi diajukan
    const naskahUpdated = await this.prisma.naskah.update({
      where: { id },
      data: {
        status: StatusNaskah.diajukan,
      },
      include: {
        penulis: true,
        kategori: true,
        genre: true,
      },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPenulis,
        jenis: 'ajukan_naskah',
        aksi: 'Ajukan Naskah',
        entitas: 'Naskah',
        idEntitas: id,
        deskripsi: `Naskah "${naskah.judul}" diajukan untuk review. ${dto.catatan || ''}`,
      },
    });

    return {
      sukses: true,
      pesan: 'Naskah berhasil diajukan untuk review',
      data: naskahUpdated,
    };
  }

  /**
   * Terbitkan naskah
   * Role: admin, editor
   */
  async terbitkanNaskah(id: string, dto: TerbitkanNaskahDto, idPengguna: string) {
    const naskah = await this.prisma.naskah.findUnique({
      where: { id },
      include: {
        penulis: {
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

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    // Validasi status: hanya siap_terbit yang bisa diterbitkan
    if (naskah.status !== StatusNaskah.siap_terbit) {
      throw new BadRequestException('Naskah hanya bisa diterbitkan jika sudah siap terbit');
    }

    // Validasi ISBN unique
    if (dto.isbn !== naskah.isbn) {
      const existingNaskah = await this.prisma.naskah.findUnique({
        where: { isbn: dto.isbn },
      });

      if (existingNaskah) {
        throw new BadRequestException('ISBN sudah digunakan oleh naskah lain');
      }
    }

    // Update naskah dengan ISBN, jumlah halaman, dan status diterbitkan
    const naskahUpdated = await this.prisma.naskah.update({
      where: { id },
      data: {
        isbn: dto.isbn,
        jumlahHalaman: dto.jumlahHalaman,
        status: StatusNaskah.diterbitkan,
        diterbitkanPada: new Date(),
        // Catatan: publik akan di-set true setelah penulis set harga jual
      },
      include: {
        penulis: true,
        kategori: true,
        genre: true,
      },
    });

    // Kirim notifikasi ke penulis
    await this.prisma.notifikasi.create({
      data: {
        idPengguna: naskah.idPenulis,
        judul: 'Naskah Anda Telah Diterbitkan!',
        pesan: `Selamat! Naskah "${naskah.judul}" telah diterbitkan dengan ISBN ${dto.isbn}. Jumlah halaman: ${dto.jumlahHalaman} halaman. Silakan atur harga jual buku Anda.`,
        tipe: 'info',
        url: `/dashboard/penulis/atur-harga`,
      },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'terbitkan_naskah',
        aksi: 'Terbitkan Naskah',
        entitas: 'Naskah',
        idEntitas: id,
        deskripsi: `Naskah "${naskah.judul}" berhasil diterbitkan dengan ISBN ${dto.isbn}, ${dto.jumlahHalaman} halaman`,
      },
    });

    return {
      sukses: true,
      pesan:
        'Naskah berhasil diterbitkan. Penulis akan menerima notifikasi untuk mengatur harga jual.',
      data: naskahUpdated,
    };
  }

  /**
   * Ubah status naskah (admin/editor)
   */
  async ubahStatus(id: string, status: StatusNaskah, idPengguna: string) {
    const naskah = await this.prisma.naskah.findUnique({
      where: { id },
      select: { id: true, judul: true, status: true, idPenulis: true },
    });

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    const statusLama = naskah.status;

    const updated = await this.prisma.naskah.update({
      where: { id },
      data: { status },
      include: {
        penulis: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: {
                namaDepan: true,
                namaBelakang: true,
                namaTampilan: true,
              },
            },
          },
        },
        kategori: true,
        genre: true,
      },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'ubah_status_naskah',
        aksi: 'Ubah Status',
        entitas: 'Naskah',
        idEntitas: id,
        deskripsi: `Mengubah status naskah "${naskah.judul}" dari ${statusLama} menjadi ${status}`,
      },
    });

    // Kirim notifikasi ke penulis
    const namaPenulis =
      updated.penulis?.profilPengguna?.namaTampilan ||
      updated.penulis?.profilPengguna?.namaDepan ||
      'Penulis';

    // In-app notification
    try {
      await this.notifikasiService.kirimNotifikasi({
        idPengguna: naskah.idPenulis,
        judul: `Status Naskah Diperbarui`,
        pesan: `Naskah "${naskah.judul}" telah diubah statusnya menjadi ${this.getLabelStatus(status)}`,
        tipe: status === 'ditolak' ? 'peringatan' : 'info',
        url: `/penulis/draf/${id}`,
      });
    } catch (e) {
      this.logger.warn(`Gagal mengirim notifikasi in-app: ${e}`);
    }

    // Email notification (async, don't block response)
    if (updated.penulis?.email) {
      this.emailService
        .kirimEmailStatusNaskah({
          emailPenerima: updated.penulis.email,
          namaPenerima: namaPenulis,
          judulNaskah: naskah.judul,
          statusBaru: status,
          statusLama: statusLama,
        })
        .catch((e) => this.logger.warn(`Gagal mengirim email: ${e}`));
    }

    return {
      sukses: true,
      pesan: 'Status naskah berhasil diubah',
      data: updated,
    };
  }

  /**
   * Helper untuk mendapatkan label status yang readable
   */
  private getLabelStatus(status: StatusNaskah): string {
    const labels: Record<StatusNaskah, string> = {
      draft: 'Draf',
      diajukan: 'Diajukan',
      dalam_review: 'Dalam Review',
      dalam_editing: 'Dalam Editing',
      siap_terbit: 'Siap Terbit',
      diterbitkan: 'Diterbitkan',
      ditolak: 'Ditolak',
    };
    return labels[status] || status;
  }

  /**
   * Penulis atur harga jual setelah naskah diterbitkan
   * Role: penulis (owner)
   */
  async aturHargaJual(id: string, hargaJual: number, idPengguna: string) {
    const naskah = await this.prisma.naskah.findUnique({
      where: { id },
      select: {
        id: true,
        idPenulis: true,
        judul: true,
        status: true,
        hargaJual: true,
      },
    });

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    // Validasi: naskah harus milik penulis yang login
    if (naskah.idPenulis !== idPengguna) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk mengatur harga naskah ini');
    }

    // Validasi: status harus "diterbitkan"
    if (naskah.status !== StatusNaskah.diterbitkan) {
      throw new BadRequestException(
        'Harga jual hanya bisa diatur untuk naskah yang sudah diterbitkan',
      );
    }

    // Validasi: harga jual harus positif
    if (hargaJual <= 0) {
      throw new BadRequestException('Harga jual harus lebih dari 0');
    }

    // Update harga jual dan set publik = true
    const naskahUpdated = await this.prisma.naskah.update({
      where: { id },
      data: {
        hargaJual,
        publik: true, // Sekarang buku bisa dijual ke publik
      },
      include: {
        penulis: true,
        kategori: true,
        genre: true,
      },
    });

    // Kirim notifikasi ke penulis
    await this.prisma.notifikasi.create({
      data: {
        idPengguna: naskah.idPenulis,
        judul: 'Harga Jual Berhasil Ditetapkan!',
        pesan: `Harga jual buku "${naskah.judul}" telah ditetapkan sebesar Rp ${hargaJual.toLocaleString('id-ID')}. Buku sekarang tersedia di katalog!`,
        tipe: 'info',
        url: `/dashboard/buku-terbit`,
      },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'atur_harga_jual',
        aksi: 'Atur Harga Jual',
        entitas: 'Naskah',
        idEntitas: id,
        deskripsi: `Harga jual buku "${naskah.judul}" ditetapkan sebesar Rp ${hargaJual.toLocaleString('id-ID')}`,
      },
    });

    return {
      sukses: true,
      pesan: 'Harga jual berhasil ditetapkan. Buku Anda sekarang tersedia di katalog!',
      data: naskahUpdated,
    };
  }

  /**
   * Hapus naskah
   * Role: penulis (owner), admin
   */
  async hapusNaskah(id: string, idPengguna: string, peranPengguna: string[]) {
    const naskah = await this.prisma.naskah.findUnique({
      where: { id },
      select: {
        id: true,
        idPenulis: true,
        judul: true,
        status: true,
      },
    });

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    // Validasi akses
    const isPenulis = peranPengguna.includes('penulis');
    const isAdmin = peranPengguna.includes('admin');

    if (isPenulis && naskah.idPenulis !== idPengguna && !isAdmin) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk menghapus naskah ini');
    }

    // Validasi: tidak bisa hapus jika sudah diterbitkan (kecuali admin)
    if (!isAdmin && naskah.status === StatusNaskah.diterbitkan) {
      throw new BadRequestException('Naskah yang sudah diterbitkan tidak bisa dihapus');
    }

    // Delete naskah (cascade akan menghapus revisi dan review)
    await this.prisma.naskah.delete({
      where: { id },
    });

    // Log activity
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna,
        jenis: 'hapus_naskah',
        aksi: 'Hapus Naskah',
        entitas: 'Naskah',
        idEntitas: id,
        deskripsi: `Naskah "${naskah.judul}" berhasil dihapus`,
      },
    });

    return {
      sukses: true,
      pesan: 'Naskah berhasil dihapus',
    };
  }

  /**
   * Ambil statistik naskah
   * Role: admin, penulis (untuk naskah sendiri)
   */
  async ambilStatistikNaskah(idPenulis?: string) {
    const where = idPenulis ? { idPenulis } : {};

    const [totalNaskah, totalPerStatus, totalPerKategori, naskahTerbaru] = await Promise.all([
      // Total naskah
      this.prisma.naskah.count({ where }),

      // Count by status
      this.prisma.naskah.groupBy({
        by: ['status'],
        where,
        _count: {
          status: true,
        },
      }),

      // Count by kategori (top 5)
      this.prisma.naskah.groupBy({
        by: ['idKategori'],
        where,
        _count: {
          idKategori: true,
        },
        orderBy: {
          _count: {
            idKategori: 'desc',
          },
        },
        take: 5,
      }),

      // Naskah terbaru (5 latest)
      this.prisma.naskah.findMany({
        where,
        orderBy: { dibuatPada: 'desc' },
        take: 5,
        select: {
          id: true,
          judul: true,
          status: true,
          dibuatPada: true,
          urlSampul: true,
        },
      }),
    ]);

    // Transform status counts to object
    const perStatus = totalPerStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<StatusNaskah, number>,
    );

    // Get kategori names
    const kategoriIds = totalPerKategori.map((item) => item.idKategori);
    const kategoriData = await this.prisma.kategori.findMany({
      where: { id: { in: kategoriIds } },
      select: { id: true, nama: true },
    });

    const perKategori = totalPerKategori.map((item) => ({
      kategori: kategoriData.find((k) => k.id === item.idKategori)?.nama || 'Unknown',
      total: item._count.idKategori,
    }));

    return {
      sukses: true,
      data: {
        totalNaskah,
        perStatus,
        perKategori,
        naskahTerbaru,
      },
    };
  }

  /**
   * Ambil feedback/review untuk naskah tertentu
   * Digunakan oleh penulis untuk melihat hasil review editor
   * Role: penulis (pemilik naskah)
   */
  async ambilFeedbackNaskah(idNaskah: string, idPenulis: string) {
    // Validasi naskah milik penulis
    const naskah = await this.prisma.naskah.findUnique({
      where: { id: idNaskah },
      select: {
        id: true,
        idPenulis: true,
        judul: true,
        status: true,
      },
    });

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    if (naskah.idPenulis !== idPenulis) {
      throw new ForbiddenException('Anda tidak memiliki akses ke naskah ini');
    }

    // Ambil semua review yang sudah selesai ATAU yang masih dalam proses dengan rekomendasi (revisi)
    const reviews = await this.prisma.reviewNaskah.findMany({
      where: {
        idNaskah,
        OR: [
          { status: StatusReview.selesai },
          // Review dalam proses dengan rekomendasi revisi (editor sudah beri feedback)
          {
            status: StatusReview.dalam_proses,
            rekomendasi: { not: null },
          },
        ],
      },
      include: {
        editor: {
          select: {
            id: true,
            email: true,
            profilPengguna: {
              select: {
                namaTampilan: true,
                urlAvatar: true,
              },
            },
          },
        },
        feedback: {
          orderBy: { dibuatPada: 'asc' },
        },
      },
      orderBy: { selesaiPada: 'desc' },
    });

    return {
      sukses: true,
      pesan: 'Feedback berhasil diambil',
      data: {
        naskah: {
          id: naskah.id,
          judul: naskah.judul,
          status: naskah.status,
        },
        reviews,
        totalReview: reviews.length,
        // Review terakhir dengan rekomendasi revisi
        reviewTerakhir: reviews[0] || null,
      },
    };
  }

  /**
   * Submit revisi naskah oleh penulis
   * Penulis bisa submit melalui konten HTML atau upload file
   * Jika submit via HTML editor, konten akan dikonversi ke DOCX
   * Role: penulis (pemilik naskah)
   */
  async submitRevisi(idNaskah: string, idPenulis: string, dto: SubmitRevisiDto) {
    // Ambil naskah dan validasi ownership
    const naskah = await this.prisma.naskah.findUnique({
      where: { id: idNaskah },
      include: {
        revisi: {
          orderBy: { versi: 'desc' },
          take: 1,
        },
        penulis: {
          select: {
            email: true,
            profilPengguna: {
              select: { namaTampilan: true },
            },
          },
        },
      },
    });

    if (!naskah) {
      throw new NotFoundException('Naskah tidak ditemukan');
    }

    if (naskah.idPenulis !== idPenulis) {
      throw new ForbiddenException('Anda tidak memiliki akses ke naskah ini');
    }

    // Validasi status: hanya bisa submit revisi saat status dalam_editing (editor minta revisi)
    if (naskah.status !== StatusNaskah.dalam_editing) {
      throw new BadRequestException(
        'Revisi hanya bisa disubmit saat naskah berstatus Dalam Editing',
      );
    }

    // Hitung versi baru
    const versiTerakhir = naskah.revisi[0]?.versi || 0;
    const versiBaru = versiTerakhir + 1;

    // Tentukan URL file
    let urlFile: string | null = dto.urlFile || null;

    // Jika ada konten HTML dari editor, konversi ke DOCX
    if (dto.konten && !dto.urlFile) {
      try {
        this.logger.log(`Mengkonversi konten HTML ke DOCX untuk naskah: ${naskah.judul}`);

        const hasilKonversi = await this.uploadService.konversiHtmlKeDocx(
          dto.konten,
          `${naskah.judul} - Revisi v${versiBaru}`,
          idPenulis,
        );

        urlFile = hasilKonversi.url;
        this.logger.log(`Berhasil konversi ke DOCX: ${urlFile}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Gagal konversi HTML ke DOCX: ${errorMsg}`);
        throw new BadRequestException('Gagal menyimpan konten naskah: ' + errorMsg);
      }
    }

    // Pastikan ada file untuk revisi
    if (!urlFile && !naskah.urlFile) {
      throw new BadRequestException('Harus mengisi konten atau upload file untuk revisi');
    }

    // Gunakan file lama jika tidak ada file baru
    urlFile = urlFile || naskah.urlFile;

    // Transaction: buat revisi baru, update status naskah, dan reset review
    const result = await this.prisma.$transaction(async (prisma) => {
      // Buat revisi baru
      const revisi = await prisma.revisiNaskah.create({
        data: {
          idNaskah,
          versi: versiBaru,
          catatan: dto.catatan || `Revisi versi ${versiBaru}`,
          urlFile: urlFile || '',
        },
      });

      // Reset review terakhir yang masih dalam_proses dengan rekomendasi revisi
      // Agar editor bisa melanjutkan review setelah penulis submit revisi
      await prisma.reviewNaskah.updateMany({
        where: {
          idNaskah,
          status: StatusReview.dalam_proses,
          rekomendasi: Rekomendasi.revisi,
        },
        data: {
          rekomendasi: null, // Reset rekomendasi agar editor bisa beri rekomendasi baru
        },
      });

      // Update naskah: ubah status ke dalam_review dan update file jika ada
      const naskahUpdated = await prisma.naskah.update({
        where: { id: idNaskah },
        data: {
          status: StatusNaskah.dalam_review,
          urlFile: urlFile,
        },
        include: {
          kategori: true,
          genre: true,
          revisi: {
            orderBy: { versi: 'desc' },
            take: 3,
          },
        },
      });

      return { revisi, naskah: naskahUpdated };
    });

    // Log aktivitas
    await this.prisma.logAktivitas.create({
      data: {
        idPengguna: idPenulis,
        jenis: 'submit_revisi',
        aksi: 'Submit Revisi',
        entitas: 'Naskah',
        idEntitas: idNaskah,
        deskripsi: `Submit revisi naskah "${naskah.judul}" versi ${versiBaru}`,
      },
    });

    // Kirim notifikasi ke editor yang menangani review naskah ini
    try {
      // Ambil editor yang sedang menangani naskah ini (review dalam_proses)
      const reviewAktif = await this.prisma.reviewNaskah.findFirst({
        where: {
          idNaskah,
          status: StatusReview.dalam_proses,
        },
        select: {
          id: true,
          idEditor: true,
          editor: {
            select: { email: true },
          },
        },
      });

      if (reviewAktif) {
        // Kirim notifikasi ke editor yang menangani
        await this.notifikasiService.kirimNotifikasi({
          idPengguna: reviewAktif.idEditor,
          judul: 'Penulis Sudah Submit Revisi',
          pesan: `Penulis telah mengirim revisi untuk naskah "${naskah.judul}" (versi ${versiBaru}). Silakan lanjutkan review.`,
          tipe: 'info',
          url: `/editor/review/${reviewAktif.id}`,
        });

        this.logger.log(
          `Notifikasi dikirim ke editor ${reviewAktif.editor?.email} untuk review ${reviewAktif.id}`,
        );
      }
    } catch (e) {
      this.logger.warn(`Gagal mengirim notifikasi revisi: ${e}`);
    }

    this.logger.log(
      `Penulis ${naskah.penulis?.profilPengguna?.namaTampilan || naskah.penulis?.email} submit revisi untuk "${naskah.judul}" (v${versiBaru})`,
    );

    return {
      sukses: true,
      pesan: `Revisi versi ${versiBaru} berhasil disubmit. Naskah akan direview ulang.`,
      data: {
        naskah: result.naskah,
        revisi: result.revisi,
        versiBaru,
      },
    };
  }
}
