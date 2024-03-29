import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FacultiesModule } from 'src/faculties/faculties.module';
import { AttachmentsModule } from 'src/attachments/attachments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FacultiesModule,
    AttachmentsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
