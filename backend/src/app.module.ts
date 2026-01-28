import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Konfigurasi
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import emailConfig from './config/email.config';

// Modules
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './common/cache/cache.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { PenggunaModule } from './modules/pengguna/pengguna.module';
import { NaskahModule } from './modules/naskah/naskah.module';
import { KategoriModule } from './modules/kategori/kategori.module';
import { GenreModule } from './modules/genre/genre.module';
import { ReviewModule } from './modules/review/review.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotifikasiModule } from './modules/notifikasi/notifikasi.module';
import { PenerbitanModule } from './modules/penerbitan/penerbitan.module';

// Common
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';

// Middlewares
import { PrismaRlsMiddleware } from './common/middlewares/prisma-rls.middleware';

// Controllers
import { AppController } from './app.controller';

@Module({
  imports: [
    // Konfigurasi global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, emailConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Throttling (Rate limiting)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 detik
        limit: 100, // maksimal 100 request per 60 detik
      },
    ]),

    // Event Emitter
    EventEmitterModule.forRoot(),

    // Scheduler
    ScheduleModule.forRoot(),

    // Serve Static Files (uploads folder)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
      },
    }),

    // Prisma
    PrismaModule,

    // Cache Module (Redis)
    CacheModule,

    // Logger Module (Async Logging)
    LoggerModule,

    // Feature Modules
    AuthModule,
    PenggunaModule,
    NaskahModule,
    KategoriModule,
    GenreModule,
    ReviewModule,
    UploadModule,
    NotifikasiModule,
    PenerbitanModule,
  ],
  controllers: [AppController],
  providers: [
    // Global Exception Filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },

    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },

    // Global Guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Middleware providers
    PrismaRlsMiddleware,
  ],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware untuk RLS
   * Middleware akan diterapkan ke semua routes kecuali yang di-exclude
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PrismaRlsMiddleware)
      .exclude(
        // Exclude public routes yang tidak memerlukan RLS
        { path: 'auth/login', method: RequestMethod.ALL },
        { path: 'auth/register', method: RequestMethod.ALL },
        { path: 'auth/verify-email/{*path}', method: RequestMethod.ALL },
        { path: 'auth/forgot-password', method: RequestMethod.ALL },
        { path: 'auth/reset-password/{*path}', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
        { path: 'docs', method: RequestMethod.ALL }, // Swagger docs
        { path: 'docs/{*path}', method: RequestMethod.ALL }, // Swagger docs assets
      )
      .forRoutes('*'); // Apply ke semua routes lainnya
  }
}
