import { Module } from '@nestjs/common';
import { NaskahController } from './naskah.controller';
import { NaskahService } from './naskah.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { NotifikasiModule } from '@/modules/notifikasi/notifikasi.module';
import { UploadModule } from '@/modules/upload/upload.module';

@Module({
  imports: [PrismaModule, NotifikasiModule, UploadModule],
  controllers: [NaskahController],
  providers: [NaskahService],
  exports: [NaskahService], // Export untuk digunakan module lain (Review, Percetakan)
})
export class NaskahModule {}
