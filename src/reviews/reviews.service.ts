import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/review.dto';
import { Review } from './entities/review.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ContributionsService } from 'src/contributions/contributions.service';

@Injectable()
export class ReviewsService extends TypeOrmCrudService<Review> {
  constructor(
    @InjectRepository(Review) private reviewsRepository: Repository<Review>,
    private readonly notificationsService: NotificationsService,
    private readonly contributionsService: ContributionsService,
  ) {
    super(reviewsRepository);
  }

  async create(
    reviewerId: number,
    { content, contribution_id }: CreateReviewDto,
  ) {
    const contribution = await this.contributionsService.findOne(
      contribution_id,
      { relations: ['db_author'] },
    );

    const review = await this.reviewsRepository.save({
      reviewer: { id: reviewerId },
      content: content,
      contribution,
    });

    try {
      await this.notificationsService.queueNotify({
        userId: contribution.db_author.id,
        templateCode: 'std02_noti',
        option: contribution.status,
        sendMail: true,
      });
    } catch (error) {}

    return review;
  }
}
