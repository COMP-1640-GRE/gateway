import { Module } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { ContributionsController } from './contributions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contribution } from './entities/contribution.entity';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { SemestersModule } from 'src/semesters/semesters.module';
import { UsersModule } from 'src/users/users.module';
import { ReactionsModule } from 'src/reactions/reactions.module';

@Module({
  imports: [
    UsersModule,
    SemestersModule,
    ReactionsModule,
    AttachmentsModule,
    TypeOrmModule.forFeature([Contribution]),
  ],
  controllers: [ContributionsController],
  providers: [ContributionsService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
