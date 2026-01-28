import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/**
 * Service untuk mengirim email notifications
 * Menggunakan nodemailer dengan konfigurasi dari environment variables
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter dengan konfigurasi dari env
   */
  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: this.configService.get<boolean>('email.secure'),
      auth: {
        user: this.configService.get<string>('email.auth.user'),
        pass: this.configService.get<string>('email.auth.pass'),
      },
    };

    // Jika tidak ada konfigurasi email, skip dan log warning
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      this.logger.warn('⚠️ Email configuration tidak lengkap. Email notifications akan di-skip.');
      return;
    }

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`❌ Email transporter verification failed: ${error.message}`);
      } else {
        this.logger.log('✅ Email service siap mengirim email');
      }
    });
  }

  /**
   * Kirim email pesanan dikirim (status: terkirim)
   */
  async kirimEmailPesananDikirim(data: {
    emailPenerima: string;
    namaPenerima: string;
    nomorPesanan: string;
    judulBuku: string;
    nomorResi: string;
    kurir: string;
    estimasiSampai: string;
  }) {
    try {
      if (!this.transporter) {
        this.logger.warn('⚠️ Email transporter tidak tersedia. Skip sending email.');
        return { sukses: false, pesan: 'Email service tidak tersedia' };
      }

      const emailFrom = this.configService.get<string>('email.from');

      const htmlContent = this.getTemplatePesananDikirim(data);

      const info = await this.transporter.sendMail({
        from: emailFrom,
        to: data.emailPenerima,
        subject: `📦 Pesanan #${data.nomorPesanan} Telah Dikirim`,
        html: htmlContent,
      });

      this.logger.log(`✅ Email pesanan dikirim terkirim ke: ${data.emailPenerima}`);

      return {
        sukses: true,
        pesan: 'Email berhasil dikirim',
        data: { messageId: info.messageId },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Gagal mengirim email: ${errorMessage}`);
      return {
        sukses: false,
        pesan: `Gagal mengirim email: ${errorMessage}`,
      };
    }
  }

  /**
   * Kirim email pesanan selesai (status: selesai)
   */
  async kirimEmailPesananSelesai(data: {
    emailPenerima: string;
    namaPenerima: string;
    nomorPesanan: string;
    judulBuku: string;
    tanggalSelesai: string;
  }) {
    try {
      if (!this.transporter) {
        this.logger.warn('⚠️ Email transporter tidak tersedia. Skip sending email.');
        return { sukses: false, pesan: 'Email service tidak tersedia' };
      }

      const emailFrom = this.configService.get<string>('email.from');

      const htmlContent = this.getTemplatePesananSelesai(data);

      const info = await this.transporter.sendMail({
        from: emailFrom,
        to: data.emailPenerima,
        subject: `✅ Pesanan #${data.nomorPesanan} Telah Selesai`,
        html: htmlContent,
      });

      this.logger.log(`✅ Email pesanan selesai terkirim ke: ${data.emailPenerima}`);

      return {
        sukses: true,
        pesan: 'Email berhasil dikirim',
        data: { messageId: info.messageId },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Gagal mengirim email: ${errorMessage}`);
      return {
        sukses: false,
        pesan: `Gagal mengirim email: ${errorMessage}`,
      };
    }
  }

  /**
   * Template HTML untuk email pesanan dikirim
   */
  private getTemplatePesananDikirim(data: {
    namaPenerima: string;
    nomorPesanan: string;
    judulBuku: string;
    nomorResi: string;
    kurir: string;
    estimasiSampai: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pesanan Dikirim</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .info-box {
            background-color: #f0fdfa;
            border-left: 4px solid #0d9488;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-row {
            display: flex;
            margin: 10px 0;
          }
          .info-label {
            font-weight: bold;
            width: 140px;
            color: #0d9488;
          }
          .info-value {
            flex: 1;
            color: #333;
          }
          .tracking-button {
            display: inline-block;
            background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .emoji {
            font-size: 48px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">📦</div>
            <h1>Pesanan Anda Telah Dikirim!</h1>
          </div>
          
          <div class="content">
            <p>Halo <strong>${data.namaPenerima}</strong>,</p>
            
            <p>Kabar baik! Pesanan Anda telah dikirim oleh percetakan dan sedang dalam perjalanan menuju alamat Anda.</p>
            
            <div class="info-box">
              <div class="info-row">
                <div class="info-label">Nomor Pesanan:</div>
                <div class="info-value"><strong>${data.nomorPesanan}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Buku:</div>
                <div class="info-value">${data.judulBuku}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Nomor Resi:</div>
                <div class="info-value"><strong>${data.nomorResi}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Kurir:</div>
                <div class="info-value">${data.kurir}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Estimasi Tiba:</div>
                <div class="info-value">${data.estimasiSampai}</div>
              </div>
            </div>
            
            <p><strong>Apa yang perlu Anda lakukan?</strong></p>
            <ol>
              <li>Pantau status pengiriman melalui nomor resi di atas</li>
              <li>Pastikan ada orang di alamat tujuan saat paket tiba</li>
              <li>Setelah menerima paket, silakan konfirmasi penerimaan di dashboard Anda</li>
            </ol>
            
            <center>
              <a href="${this.configService.get<string>('FRONTEND_URL')}/penulis/pesanan-cetak" class="tracking-button">
                Lihat Detail Pesanan
              </a>
            </center>
            
            <p>Jika ada pertanyaan atau kendala, jangan ragu untuk menghubungi kami.</p>
            
            <p>Terima kasih telah menggunakan Publishify!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Publishify. Semua hak dilindungi.</p>
            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML untuk email pesanan selesai
   */
  private getTemplatePesananSelesai(data: {
    namaPenerima: string;
    nomorPesanan: string;
    judulBuku: string;
    tanggalSelesai: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pesanan Selesai</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .success-box {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-row {
            display: flex;
            margin: 10px 0;
          }
          .info-label {
            font-weight: bold;
            width: 140px;
            color: #10b981;
          }
          .info-value {
            flex: 1;
            color: #333;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .emoji {
            font-size: 48px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🎉</div>
            <h1>Pesanan Selesai!</h1>
          </div>
          
          <div class="content">
            <p>Halo <strong>${data.namaPenerima}</strong>,</p>
            
            <p>Terima kasih atas konfirmasi penerimaan Anda! Pesanan Anda telah diselesaikan dengan sukses.</p>
            
            <div class="success-box">
              <div class="info-row">
                <div class="info-label">Nomor Pesanan:</div>
                <div class="info-value"><strong>${data.nomorPesanan}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Buku:</div>
                <div class="info-value">${data.judulBuku}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Tanggal Selesai:</div>
                <div class="info-value">${data.tanggalSelesai}</div>
              </div>
            </div>
            
            <p><strong>Langkah Selanjutnya:</strong></p>
            <ul>
              <li>Anda dapat melihat riwayat pesanan lengkap di dashboard</li>
              <li>Beri rating dan review untuk membantu penulis lain</li>
              <li>Jelajahi buku-buku lainnya untuk dicetak</li>
            </ul>
            
            <center>
              <a href="${this.configService.get<string>('FRONTEND_URL')}/penulis/pesanan-cetak" class="cta-button">
                Lihat Riwayat Pesanan
              </a>
            </center>
            
            <p>Kami senang dapat melayani Anda. Terima kasih telah mempercayai Publishify untuk kebutuhan cetak buku Anda!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Publishify. Semua hak dilindungi.</p>
            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Kirim email notifikasi perubahan status naskah
   */
  async kirimEmailStatusNaskah(data: {
    emailPenerima: string;
    namaPenerima: string;
    judulNaskah: string;
    statusBaru: string;
    statusLama: string;
  }) {
    try {
      if (!this.transporter) {
        this.logger.warn('⚠️ Email transporter tidak tersedia. Skip sending email.');
        return { sukses: false, pesan: 'Email service tidak tersedia' };
      }

      const emailFrom = this.configService.get<string>('email.from');
      const { subject, emoji, headerColor, message, ctaText, ctaUrl } = this.getStatusEmailConfig(
        data.statusBaru,
      );

      const htmlContent = this.getTemplateStatusNaskah({
        ...data,
        subject,
        emoji,
        headerColor,
        message,
        ctaText,
        ctaUrl,
      });

      const info = await this.transporter.sendMail({
        from: emailFrom,
        to: data.emailPenerima,
        subject: `${emoji} ${subject} - "${data.judulNaskah}"`,
        html: htmlContent,
      });

      this.logger.log(`✅ Email status naskah terkirim ke: ${data.emailPenerima}`);

      return {
        sukses: true,
        pesan: 'Email berhasil dikirim',
        data: { messageId: info.messageId },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Gagal mengirim email status naskah: ${errorMessage}`);
      return {
        sukses: false,
        pesan: `Gagal mengirim email: ${errorMessage}`,
      };
    }
  }

  /**
   * Konfigurasi email berdasarkan status naskah
   */
  private getStatusEmailConfig(status: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const configs: Record<
      string,
      {
        subject: string;
        emoji: string;
        headerColor: string;
        message: string;
        ctaText: string;
        ctaUrl: string;
      }
    > = {
      dalam_review: {
        subject: 'Naskah Sedang Direview',
        emoji: '🔍',
        headerColor: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        message:
          'Naskah Anda telah diterima dan sedang dalam proses review oleh tim editor kami. Kami akan menghubungi Anda setelah proses review selesai.',
        ctaText: 'Lihat Status Naskah',
        ctaUrl: `${frontendUrl}/penulis/draf`,
      },
      dalam_editing: {
        subject: 'Naskah Masuk Tahap Editing',
        emoji: '✏️',
        headerColor: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        message:
          'Selamat! Naskah Anda telah lolos review dan sekarang masuk tahap editing. Tim editor kami akan menyempurnakan naskah Anda untuk persiapan penerbitan.',
        ctaText: 'Lihat Progress',
        ctaUrl: `${frontendUrl}/penulis/draf`,
      },
      siap_terbit: {
        subject: 'Naskah Siap Diterbitkan!',
        emoji: '📋',
        headerColor: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        message:
          'Naskah Anda telah selesai diedit dan siap untuk diterbitkan! Silakan lengkapi dokumen-dokumen yang diperlukan (Surat Perjanjian, Surat Keaslian, Proposal, dan Bukti Transfer) untuk melanjutkan proses penerbitan.',
        ctaText: 'Lengkapi Dokumen',
        ctaUrl: `${frontendUrl}/penulis/draf`,
      },
      diterbitkan: {
        subject: 'Selamat! Naskah Telah Diterbitkan',
        emoji: '🎉',
        headerColor: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
        message:
          'Selamat! Naskah Anda telah resmi diterbitkan dan kini tersedia di katalog Publishify. Anda dapat mulai menjual buku Anda kepada pembaca.',
        ctaText: 'Lihat Buku Saya',
        ctaUrl: `${frontendUrl}/penulis/buku-terbit`,
      },
      ditolak: {
        subject: 'Pemberitahuan Status Naskah',
        emoji: '📝',
        headerColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        message:
          'Mohon maaf, setelah melalui proses review, naskah Anda belum dapat kami terbitkan saat ini. Anda dapat memperbaiki naskah dan mengajukan kembali.',
        ctaText: 'Revisi Naskah',
        ctaUrl: `${frontendUrl}/penulis/draf`,
      },
      diajukan: {
        subject: 'Naskah Berhasil Diajukan',
        emoji: '📤',
        headerColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        message:
          'Naskah Anda telah berhasil diajukan untuk review. Tim kami akan segera memeriksa naskah Anda.',
        ctaText: 'Lihat Status',
        ctaUrl: `${frontendUrl}/penulis/draf`,
      },
    };

    return (
      configs[status] || {
        subject: 'Update Status Naskah',
        emoji: '📚',
        headerColor: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        message: `Status naskah Anda telah diperbarui menjadi: ${status}`,
        ctaText: 'Lihat Detail',
        ctaUrl: `${frontendUrl}/penulis/draf`,
      }
    );
  }

  /**
   * Template HTML untuk email status naskah
   */
  private getTemplateStatusNaskah(data: {
    namaPenerima: string;
    judulNaskah: string;
    statusBaru: string;
    statusLama: string;
    subject: string;
    emoji: string;
    headerColor: string;
    message: string;
    ctaText: string;
    ctaUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            background: ${data.headerColor};
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 25px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
          }
          .book-info {
            background-color: #f8fafc;
            border-left: 4px solid #6366f1;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
          }
          .book-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            margin: 0;
          }
          .cta-button {
            display: inline-block;
            background: ${data.headerColor};
            color: white !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            margin: 25px 0;
            font-weight: bold;
            font-size: 16px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .emoji {
            font-size: 56px;
            margin: 15px 0;
          }
          .message-box {
            background-color: #fefefe;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">${data.emoji}</div>
            <h1>${data.subject}</h1>
          </div>
          
          <div class="content">
            <p>Halo <strong>${data.namaPenerima}</strong>,</p>
            
            <div class="book-info">
              <p class="book-title">📖 ${data.judulNaskah}</p>
            </div>
            
            <div class="message-box">
              <p>${data.message}</p>
            </div>
            
            <center>
              <a href="${data.ctaUrl}" class="cta-button">
                ${data.ctaText}
              </a>
            </center>
            
            <p style="margin-top: 30px;">Jika ada pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>
            
            <p>Salam hangat,<br><strong>Tim Publishify</strong></p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Publishify. Semua hak dilindungi.</p>
            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
