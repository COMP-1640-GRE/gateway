import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import { NestjsFingerprintModule } from 'nestjs-fingerprint';
import { join } from 'path';
import { RedisClientOptions } from 'redis';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AttachmentsModule } from './attachments/attachments.module';
import { AuthModule } from './auth/auth.module';
import { EventsGuard } from './auth/guards/events.guard';
import { JwtGuard } from './auth/guards/jwt.guard';
import { OwnerGuard } from './auth/guards/owner.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CommentsModule } from './comments/comments.module';
import { ContributionsModule } from './contributions/contributions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { FacultiesModule } from './faculties/faculties.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReactionsModule } from './reactions/reactions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SemestersModule } from './semesters/semesters.module';
import { SystemsModule } from './systems/systems.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      ssl: true,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    NestjsFingerprintModule.forRoot({
      params: ['headers', 'userAgent', 'ipAddress'],
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASS,
        db: parseInt(process.env.REDIS_DB),
        name: process.env.REDIS_NAME,
        username: process.env.REDIS_USER,
      },
    }),
    AuthModule,
    UsersModule,
    FacultiesModule,
    SemestersModule,
    ContributionsModule,
    AttachmentsModule,
    ReviewsModule,
    ReactionsModule,
    CommentsModule,
    SystemsModule,
    NotificationsModule,
    DashboardModule,
    EventsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OwnerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EventsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
