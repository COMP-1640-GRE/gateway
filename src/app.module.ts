import { CacheModule } from '@nestjs/cache-manager';
import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/jwt.guard';
import { RolesGuard } from './auth/roles.guard';
import { FacultiesModule } from './faculties/faculties.module';
import { SemestersModule } from './semesters/semesters.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    CacheModule.register({ isGlobal: true }),
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
    AuthModule,
    UsersModule,
    FacultiesModule,
    SemestersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      // useClass: AuthGuard,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
