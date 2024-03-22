import { Module } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ContributionsController } from './contributions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contribution } from './entities/contribution.entity';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { SemestersModule } from 'src/semesters/semesters.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
    SemestersModule,
    AttachmentsModule,
    TypeOrmModule.forFeature([Contribution]),
  ],
  controllers: [ContributionsController],
  providers: [ContributionsService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
