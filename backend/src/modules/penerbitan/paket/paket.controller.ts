import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaketService } from './paket.service';
import { BuatPaketDto, PerbaruiPaketDto } from './dto/paket.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PeranGuard } from '../../auth/guards/roles.guard';
import { Peran } from '../../auth/decorators/peran.decorator';
import { Public } from '../../../common/decorators/public.decorator';

/**
 * Controller untuk mengelola paket penerbitan
 */
@ApiTags('penerbitan')
@Controller('paket-penerbitan')
export class PaketController {
  constructor(private readonly paketService: PaketService) {}

  /**
   * Ambil semua paket penerbitan (publik)
   */
  @Get()
  @Public()
  @ApiOperation({ summary: 'Ambil daftar paket penerbitan' })
  @ApiQuery({ name: 'termasukTidakAktif', required: false, type: Boolean })
  async ambilSemuaPaket(@Query('termasukTidakAktif') termasukTidakAktif?: boolean) {
    return this.paketService.ambilSemuaPaket(termasukTidakAktif);
  }

  /**
   * Ambil detail paket (publik)
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Ambil detail paket penerbitan' })
  async ambilPaketById(@Param('id') id: string) {
    return this.paketService.ambilPaketById(id);
  }

  /**
   * Buat paket baru (admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat paket penerbitan baru (admin)' })
  async buatPaket(@Body() dto: BuatPaketDto) {
    return this.paketService.buatPaket(dto);
  }

  /**
   * Perbarui paket (admin only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perbarui paket penerbitan (admin)' })
  async perbaruiPaket(@Param('id') id: string, @Body() dto: PerbaruiPaketDto) {
    return this.paketService.perbaruiPaket(id, dto);
  }

  /**
   * Nonaktifkan paket (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PeranGuard)
  @Peran('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Nonaktifkan paket penerbitan (admin)' })
  async hapusPaket(@Param('id') id: string) {
    return this.paketService.hapusPaket(id);
  }
}
