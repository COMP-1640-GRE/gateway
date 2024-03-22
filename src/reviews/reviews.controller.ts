import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { Owner } from 'src/decorators/owner.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateReviewDto } from './dto/review.dto';
import { REVIEW_ENTITY, Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';

@ApiTags('Reviews')
@Controller('reviews')
@Crud({
  model: {
    type: Review,
  },
  query: {
    limit: 100,
    cache: 200,
  },
  routes: {
    only: ['getOneBase', 'updateOneBase', 'deleteOneBase'],
    updateOneBase: {
      decorators: [
        Roles(UserRole.FACULTY_MARKETING_COORDINATOR),
        Owner(REVIEW_ENTITY, 'reviewer_id'),
      ],
    },
    deleteOneBase: {
      decorators: [
        Roles(UserRole.FACULTY_MARKETING_COORDINATOR),
        Owner(REVIEW_ENTITY, 'reviewer_id'),
      ],
    },
  },
  params: {
    id: {
      type: 'number',
      primary: true,
      field: 'id',
    },
  },
})
export class ReviewsController implements CrudController<Review> {
  constructor(public service: ReviewsService) {}

  @Post()
  @Roles(UserRole.FACULTY_MARKETING_COORDINATOR)
  create(
    @Body() updateReviewDto: CreateReviewDto,
    @JwtPayload() { id: userId }: JwtPayloadType,
  ) {
    return this.service.create(userId, updateReviewDto);
  }
}
