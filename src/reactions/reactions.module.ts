import { Module } from '@nestjs/common';
import { Reaction } from './entities/reaction.entity';
import { ReactionsController } from './reactions.controller';
import { ReactionsService } from './reactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction])],
  controllers: [ReactionsController],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
