import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedRequest,
} from '@nestjsx/crud';
import { Fingerprint, IFingerprint } from 'nestjs-fingerprint';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';
import { Owner } from 'src/decorators/owner.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { mapContributions } from 'src/utils/contribution';
import { ContributionsService } from './contributions.service';
import {
  CreateContributionDto,
  EvaluateDto,
  SelectManyDto,
  StatusDto,
  UpdateContributionDto,
} from './dto/contribution.dto';
import {
  CONTRIBUTION_ENTITY,
  Contribution,
} from './entities/contribution.entity';
import { CreateReactionDto } from 'src/reactions/dto/create-reaction.dto';
import { ReactionsService } from 'src/reactions/reactions.service';

@ApiTags('Contributions')
@Controller('contributions')
@Crud({
  model: {
    type: Contribution,
  },
  query: {
    limit: 100,
    alwaysPaginate: true,
    join: {
      attachments: {
        eager: true,
      },
      reviews: {
        eager: true,
      },
      student: {
        eager: true,
      },
      semester: {
        eager: true,
      },
      'semester.faculty': {
        eager: true,
      },
      reactions: {
        eager: true,
      },
      'reactions.user': {
        eager: true,
      },
    },
    cache: 200,
  },
  routes: {
    only: ['getManyBase'],
  },
  params: {
    id: {
      type: 'number',
      primary: true,
      field: 'id',
    },
  },
})
export class ContributionsController implements CrudController<Contribution> {
  constructor(
    public service: ContributionsService,
    private readonly reactionsService: ReactionsService,
  ) {}
  get base(): CrudController<Contribution> {
    return this;
  }
  @Post()
  @Roles(UserRole.STUDENT)
  @ApiBody({ type: CreateContributionDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('attachments'))
  create(
    @Body() dto: CreateContributionDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 15 })],
      }),
    )
    attachments: Array<Express.Multer.File>,
    @JwtPayload() { id: userId }: JwtPayloadType,
  ) {
    return this.service.create(userId, dto, attachments);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Fingerprint() fp: IFingerprint) {
    return this.service.findOneById(+id, fp.id);
  }

  @Patch('select-multiple')
  @Roles(UserRole.UNIVERSITY_MARKETING_MANAGER)
  selectMultiple(@Body() { ids }: SelectManyDto) {
    return this.service.selectMultiple(ids);
  }

  @Post('download')
  @Roles(UserRole.UNIVERSITY_MARKETING_MANAGER)
  // @Header(
  //   'Content-Disposition',
  //   'attachment; filename="contributions.zip"; mime-type="application/zip"',
  // )
  download(@Body() { ids }: SelectManyDto) {
    return this.service.download(ids);
  }

  @Patch(':id/select')
  @Roles(UserRole.UNIVERSITY_MARKETING_MANAGER)
  select(@Param('id') id: string) {
    return this.service.select(+id);
  }

  @Patch(':id/evaluate')
  @Roles(UserRole.FACULTY_MARKETING_COORDINATOR)
  evaluate(@Param('id') id: string, @Body() dto: EvaluateDto) {
    return this.service.evaluate(+id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.FACULTY_MARKETING_COORDINATOR)
  status(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.service.status(+id, dto);
  }

  @Post(':id/reaction')
  reaction(
    @Param('id') id: string,
    @Body() { type }: CreateReactionDto,
    @JwtPayload() { id: userId }: JwtPayloadType,
  ) {
    return this.reactionsService.reaction({
      user_id: +userId,
      contribution_id: +id,
      type,
    });
  }

  @Override('getManyBase')
  async getMany(@ParsedRequest() req: CrudRequest) {
    const res = await this.base.getManyBase(req);

    if (Array.isArray(res)) {
      return mapContributions(res);
    }

    res.data = mapContributions(res.data);
    return res;
  }

  @Patch(':id')
  @Roles(UserRole.STUDENT)
  @Owner(CONTRIBUTION_ENTITY, 'student_id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateContributionDto })
  @UseInterceptors(FilesInterceptor('attachments'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContributionDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 15 })],
        fileIsRequired: false,
      }),
    )
    attachments: Array<Express.Multer.File>,
    @JwtPayload() { id: userId }: JwtPayloadType,
  ) {
    return this.service.update(+id, userId, dto, attachments);
  }

  @Delete(':id')
  @Roles(UserRole.STUDENT, UserRole.ADMINISTRATOR)
  @Owner(CONTRIBUTION_ENTITY, 'student_id', false, [UserRole.ADMINISTRATOR])
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
