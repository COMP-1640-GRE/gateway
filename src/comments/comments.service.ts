import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { TreeRepository } from 'typeorm';
import { CreateCommentDto } from './dto/comment.dto';
import { Comment } from './entities/comment.entity';
import { SystemsService } from 'src/systems/systems.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Contribution } from 'src/contributions/entities/contribution.entity';

@Injectable()
export class CommentsService extends TypeOrmCrudService<Comment> {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: TreeRepository<Comment>,

    @InjectRepository(Contribution)
    private contributionsRepository: TreeRepository<Contribution>,

    private readonly systemsService: SystemsService,
    private readonly notificationsService: NotificationsService,
  ) {
    super(commentsRepository);
  }

  async create(userId: number, dto: CreateCommentDto, facultyId?: number) {
    const { contribution_id, parent_id, ...rest } = dto;
    if (!contribution_id && !parent_id) {
      throw new BadRequestException('Comment must have contribution or parent');
    }

    const blockedWords = await this.systemsService.getFacultyBlockedWords(
      facultyId,
    );
    let blocked = false;

    if (
      blockedWords.some((word) =>
        rest.content.toLowerCase().includes(word.toLowerCase()),
      )
    ) {
      blocked = true;
    }

    const contribution = await this.contributionsRepository.findOne(
      contribution_id,
      {
        relations: ['db_author'],
      },
    );

    if (!contribution) {
      throw new BadRequestException('Contribution not found');
    }

    let parent: Comment = null;

    if (parent_id) {
      parent = await this.commentsRepository.findOne(parent_id);

      if (!parent) {
        throw new BadRequestException('Parent comment not found');
      }
    }

    await this.notificationsService.queueNotify({
      userId: contribution.db_author.id,
      templateCode: 'std03_noti',
    });

    return this.commentsRepository.save({
      ...rest,
      parent,
      contribution,
      db_author: { id: userId },
      blocked,
    });
  }

  async getComments(contributionId: number) {
    const rootComments = await this.commentsRepository.find({
      where: { contribution: { id: contributionId }, parent: null },
      relations: ['db_author', 'reactions', 'reactions.user'],
    });

    const rootCommentsWithChildren = await Promise.all(
      rootComments.map(async (rootComment) =>
        this.commentsRepository.findDescendantsTree(rootComment, {
          relations: ['db_author', 'reactions', 'reactions.user'],
        }),
      ),
    );

    return rootCommentsWithChildren;
  }
}
