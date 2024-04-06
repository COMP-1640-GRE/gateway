import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentsModule } from 'src/attachments/attachments.module';
import { CommentsModule } from 'src/comments/comments.module';
import { ReactionsModule } from 'src/reactions/reactions.module';
import { SemestersModule } from 'src/semesters/semesters.module';
import { UsersModule } from 'src/users/users.module';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { Contribution } from './entities/contribution.entity';

@Module({
  imports: [
    UsersModule,
    CommentsModule,
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
