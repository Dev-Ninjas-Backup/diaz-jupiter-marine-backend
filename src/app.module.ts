import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AppController } from './app.controller';
import { ENVEnum } from './common/enum/env.enum';
import { JwtStrategy } from './common/jwt/jwt.strategy';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { LibModule } from './lib/lib.module';
import { MainModule } from './main/main.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    CacheModule.register({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 60 },
      { name: 'email', ttl: 900_000, limit: 3 },
      { name: 'contact', ttl: 600_000, limit: 5 },
    ]),

    ScheduleModule.forRoot(),

    ServeStaticModule.forRoot(
      {
        rootPath: join(process.cwd(), 'uploads'),
        serveRoot: '/api/files',
      },
      {
        rootPath: join(process.cwd(), 'public'),
        serveRoot: '/public',
      },
    ),

    PassportModule,

    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: await config.getOrThrow(ENVEnum.JWT_SECRET),
        signOptions: {
          expiresIn: await config.getOrThrow(ENVEnum.JWT_EXPIRES_IN),
        },
      }),
    }),

    LibModule,
    MainModule,
  ],
  controllers: [AppController],
  providers: [JwtStrategy, { provide: APP_GUARD, useClass: ThrottlerGuard }],
  exports: [JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
