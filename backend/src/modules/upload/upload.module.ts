import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      // Gunakan memory storage karena kita handle file save di service
      storage: undefined, // default ke memory storage
      limits: {
        fileSize: 50 * 1024 * 1024, // max 50MB (untuk naskah PDF)
        files: 10, // max 10 files untuk multiple upload
      },
      fileFilter: (req, file, callback) => {
        // Basic file filter - detailed validation di service
        const allowedMimes = [
          // Documents
          'application/pdf',
          'application/msword', // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'application/vnd.ms-excel', // .xls
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/rtf', // .rtf
          'text/plain', // .txt
          'text/rtf',
          // Images
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/svg+xml',
          // Allow octet-stream for some browsers that don't detect mime correctly
          'application/octet-stream',
        ];

        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error(
              `Tipe file tidak diperbolehkan (${file.mimetype}). Hanya PDF, DOC, DOCX, XLSX, TXT, dan gambar (JPEG, PNG, WebP, GIF)`,
            ),
            false,
          );
        }
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
