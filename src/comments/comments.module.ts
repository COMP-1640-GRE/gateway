import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsModule } from 'src/reactions/reactions.module';

@Module({
  imports: [ReactionsModule, TypeOrmModule.forFeature([Comment])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
