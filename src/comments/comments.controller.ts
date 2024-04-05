import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { Owner } from 'src/decorators/owner.decorator';
import { CommentsService } from './comments.service';
import { COMMENT_ENTITY, Comment } from './entities/comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';

@ApiTags('Comments')
@Controller('comments')
@Crud({
  model: { type: Comment },
  dto: {
    update: UpdateCommentDto,
  },
  query: {
    limit: 100,
    cache: 200,
  },
  routes: {
    only: ['getOneBase', 'updateOneBase', 'deleteOneBase'],
    updateOneBase: {
      decorators: [Owner(COMMENT_ENTITY, 'user_id')],
    },
    deleteOneBase: {
      decorators: [Owner(COMMENT_ENTITY, 'user_id')],
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
export class CommentsController implements CrudController<Comment> {
  constructor(public service: CommentsService) {}

  @Post()
  create(@Body() dto: CreateCommentDto, @JwtPayload() { id }: JwtPayloadType) {
    return this.service.create(id, dto);
  }
}
