import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TreeRepository } from 'typeorm';
import { CreateCommentDto } from './dto/comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService extends TypeOrmCrudService<Comment> {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: TreeRepository<Comment>,
  ) {
    super(commentRepository);
  }

  async create(userId: number, dto: CreateCommentDto) {
    const { contribution_id, parent_id, ...rest } = dto;
    if (!contribution_id && !parent_id) {
      throw new BadRequestException('Comment must have contribution or parent');
    }

    const contribution = contribution_id ? { id: contribution_id } : null;
    let parent: Comment = null;

    if (parent_id) {
      parent = await this.commentRepository.findOne(parent_id);

      if (!parent) {
        throw new BadRequestException('Parent comment not found');
      }
    }

    return this.commentRepository.save({
      parent,
      contribution,
      db_author: { id: userId },
      ...rest,
    });
  }

  async getComments(contributionId: number) {
    const rootComments = await this.commentRepository.find({
      where: { contribution: { id: contributionId }, parent: null },
      relations: ['db_author', 'reactions', 'reactions.user'],
    });

    const rootCommentsWithChildren = await Promise.all(
      rootComments.map(async (rootComment) =>
        this.commentRepository.findDescendantsTree(rootComment, {
          relations: ['db_author', 'reactions', 'reactions.user'],
        }),
      ),
    );

    return rootCommentsWithChildren;
  }
}
