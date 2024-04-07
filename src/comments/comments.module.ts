import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsModule } from 'src/reactions/reactions.module';
import { SystemsModule } from 'src/systems/systems.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Contribution } from 'src/contributions/entities/contribution.entity';

@Module({
  imports: [
    SystemsModule,
    ReactionsModule,
    TypeOrmModule.forFeature([Comment, Contribution]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
