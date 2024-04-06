import { Body, Controller, Param, Post } from '@nestjs/common';
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
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { ReactionsService } from 'src/reactions/reactions.service';

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
      decorators: [Owner(COMMENT_ENTITY, 'db_author_id')],
    },
    deleteOneBase: {
      decorators: [Owner(COMMENT_ENTITY, 'db_author_id')],
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
  constructor(
    public service: CommentsService,
    private readonly reactionsService: ReactionsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateCommentDto,
    @JwtPayload() { id, faculty }: JwtPayloadType,
  ) {
    return this.service.create(id, dto, faculty?.id);
  }

  @Post(':id/reaction')
  reaction(
    @Param('id') id: string,
    @Body() { type }: CreateReactionDto,
    @JwtPayload() { id: userId }: JwtPayloadType,
  ) {
    return this.reactionsService.reaction({
      user_id: +userId,
      comment_id: +id,
      type,
    });
  }
}
