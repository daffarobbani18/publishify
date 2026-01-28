import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PesananTerbitService } from './pesanan-terbit.service';
import {
  BuatPesananTerbitDto,
  SpesifikasiBukuDto,
  KelengkapanNaskahDto,
  UpdateStatusPesananDto,
  FilterPesananDto,
} from './dto/pesanan-terbit.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PeranGuard } from '../../auth/guards/roles.guard';
import { Peran } from '../../auth/decorators/peran.decorator';
import { PenggunaSaatIni } from '../../auth/decorators/pengguna-saat-ini.decorator';

/**
 * Controller untuk mengelola pesanan penerbitan
 */
@ApiTags('penerbitan')
@Controller('pesanan-terbit')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PesananTerbitController {
  constructor(private readonly pesananService: PesananTerbitService) {}

  /**
   * Buat pesanan penerbitan baru (penulis)
   */
  @Post()
  @UseGuards(PeranGuard)
  @Peran('penulis')
  @ApiOperation({ summary: 'Buat pesanan penerbitan baru' })
  async buatPesanan(@PenggunaSaatIni('id') idPenulis: string, @Body() dto: BuatPesananTerbitDto) {
    return this.pesananService.buatPesanan(idPenulis, dto);
  }

  /**
   * Ambil daftar pesanan penulis
   */
  @Get('saya')
  @UseGuards(PeranGuard)
  @Peran('penulis')
  @ApiOperation({ summary: 'Ambil daftar pesanan penerbitan saya' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'statusPembayaran', required: false })
  @ApiQuery({ name: 'halaman', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async ambilPesananSaya(
    @PenggunaSaatIni('id') idPenulis: string,
    @Query() filter: FilterPesananDto,
  ) {
    return this.pesananService.ambilPesananPenulis(idPenulis, filter);
  }

  /**
   * Ambil detail pesanan (penulis)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail pesanan penerbitan' })
  async ambilDetailPesanan(@Param('id') id: string, @PenggunaSaatIni('id') idPenulis: string) {
    return this.pesananService.ambilDetailPesanan(id, idPenulis);
  }

  /**
   * Update spesifikasi buku
   */
  @Put(':id/spesifikasi')
  @UseGuards(PeranGuard)
  @Peran('penulis')
  @ApiOperation({ summary: 'Update spesifikasi buku' })
  async updateSpesifikasi(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPenulis: string,
    @Body() dto: SpesifikasiBukuDto,
  ) {
    return this.pesananService.updateSpesifikasi(id, idPenulis, dto);
  }

  /**
   * Update kelengkapan naskah
   */
  @Put(':id/kelengkapan')
  @UseGuards(PeranGuard)
  @Peran('penulis')
  @ApiOperation({ summary: 'Update kelengkapan naskah' })
  async updateKelengkapan(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPenulis: string,
    @Body() dto: KelengkapanNaskahDto,
  ) {
    return this.pesananService.updateKelengkapan(id, idPenulis, dto);
  }

  /**
   * Upload bukti pembayaran (transfer)
   */
  @Put(':id/bukti-pembayaran')
  @UseGuards(PeranGuard)
  @Peran('penulis')
  @UseInterceptors(FileInterceptor('buktiPembayaran'))
  @ApiOperation({ summary: 'Upload bukti pembayaran' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        buktiPembayaran: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadBuktiPembayaran(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idPenulis: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pesananService.uploadBuktiPembayaran(id, idPenulis, file);
  }

  /**
   * Update status pesanan (admin/editor)
   */
  @Put(':id/status')
  @UseGuards(PeranGuard)
  @Peran('admin', 'editor')
  @ApiOperation({ summary: 'Update status pesanan (admin/editor)' })
  async updateStatus(
    @Param('id') id: string,
    @PenggunaSaatIni('id') idUser: string,
    @Body() dto: UpdateStatusPesananDto,
  ) {
    return this.pesananService.updateStatus(id, idUser, dto);
  }

  /**
   * Ambil semua pesanan (admin)
   */
  @Get()
  @UseGuards(PeranGuard)
  @Peran('admin', 'editor')
  @ApiOperation({ summary: 'Ambil semua pesanan penerbitan (admin/editor)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'statusPembayaran', required: false })
  @ApiQuery({ name: 'halaman', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async ambilSemuaPesanan(@Query() filter: FilterPesananDto) {
    return this.pesananService.ambilSemuaPesanan(filter);
  }
}
