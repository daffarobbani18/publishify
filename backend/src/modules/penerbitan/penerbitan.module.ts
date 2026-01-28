import { Module } from '@nestjs/common';
import { PaketController } from './paket/paket.controller';
import { PaketService } from './paket/paket.service';
import { PesananTerbitController } from './pesanan/pesanan-terbit.controller';
import { PesananTerbitService } from './pesanan/pesanan-terbit.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * Modul Penerbitan - Mengelola alur penerbitan buku
 * 
 * Alur:
 * 1. Pilih Paket Terbit
 * 2. Kirim Naskah
 * 3. Pemeriksaan Naskah
 * 4. Proses Penerbitan (editing, layout, ISBN)
 * 5. Distribusi & Pemasaran
 */
@Module({
  imports: [PrismaModule],
  controllers: [PaketController, PesananTerbitController],
  providers: [PaketService, PesananTerbitService],
  exports: [PaketService, PesananTerbitService],
})
export class PenerbitanModule {}
