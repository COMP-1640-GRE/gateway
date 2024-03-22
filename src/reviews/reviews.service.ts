import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/review.dto';
import { Review } from './entities/review.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewsService extends TypeOrmCrudService<Review> {
  constructor(
    @InjectRepository(Review) private reviewsRepository: Repository<Review>,
  ) {
    super(reviewsRepository);
  }

  create(reviewerId: number, { content, contribution_id }: CreateReviewDto) {
    return this.reviewsRepository.save({
      reviewer: { id: reviewerId },
      content: content,
      contribution: { id: contribution_id },
    });
  }
}
