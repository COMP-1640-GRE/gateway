import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ChannelCredentials } from '@grpc/grpc-js';
import { SystemsModule } from 'src/systems/systems.module';
import { EventsModule } from 'src/events/events.module';

@Global()
@Module({
  imports: [
    EventsModule,
    SystemsModule,
    TypeOrmModule.forFeature([Notification]),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('FILE_TRANSFER_PACKAGE_URL'),
            package: 'notification',
            protoPath: join(__dirname, '../proto/notification.proto'),
            loader: { keepCase: true },
            credentials: ChannelCredentials.createSsl(),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
