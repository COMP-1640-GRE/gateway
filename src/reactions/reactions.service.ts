import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { ReactionDto } from './dto/create-reaction.dto';

@Injectable()
export class ReactionsService extends TypeOrmCrudService<Reaction> {
  constructor(
    @InjectRepository(Reaction)
    private contributionRepository: Repository<Reaction>,
  ) {
    super(contributionRepository);
  }

  async reaction({ user_id, contribution_id, comment_id, type }: ReactionDto) {
    const user = { id: user_id };

    if (contribution_id) {
      const contribution = { id: contribution_id };

      const reaction = await this.contributionRepository.findOne({
        where: { user, contribution },
      });
      if (reaction) {
        if (reaction.type === type) {
          await this.contributionRepository.delete(reaction.id);
        } else {
          await this.contributionRepository.update(reaction.id, {
            type,
          });
        }
      } else {
        await this.contributionRepository.save({
          user,
          contribution,
          type,
        });
      }
    } else if (comment_id) {
    }

    return true;
  }
}
