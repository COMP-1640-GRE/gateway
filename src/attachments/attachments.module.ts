import { ChannelCredentials } from '@grpc/grpc-js';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { Attachment } from './entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
    ClientsModule.registerAsync([
      {
        name: 'FILE_TRANSFER_PACKAGE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('FILE_TRANSFER_PACKAGE_URL'),
            package: 'filetransfer',
            protoPath: join(__dirname, '../proto/filetransfer.proto'),
            loader: { keepCase: true },
            credentials: ChannelCredentials.createSsl(),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
