import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { ReactionDto } from './dto/create-reaction.dto';
import { Reaction } from './entities/reaction.entity';

@Injectable()
export class ReactionsService extends TypeOrmCrudService<Reaction> {
  constructor(
    @InjectRepository(Reaction)
    private reactionsRepository: Repository<Reaction>,
  ) {
    super(reactionsRepository);
  }

  async reaction({ user_id, contribution_id, comment_id, type }: ReactionDto) {
    const user = { id: user_id };
    let target = {};
    if (contribution_id) {
      target = { contribution: { id: contribution_id } };
    } else if (comment_id) {
      target = { comment: { id: comment_id } };
    } else {
      throw new BadRequestException('Need to provide contribution or comment');
    }

    const existingReaction = await this.reactionsRepository.findOne({
      where: { user, ...target },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await this.reactionsRepository.delete(existingReaction.id);
      } else {
        await this.reactionsRepository.update(existingReaction.id, { type });
      }
    } else {
      await this.reactionsRepository.save({ user, ...target, type });
    }

    return { message: 'success' };
  }
}
