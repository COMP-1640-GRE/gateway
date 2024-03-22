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
import { Crud, CrudController } from '@nestjsx/crud';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ContributionsService } from './contributions.service';
import {
  CreateContributionDto,
  EvaluateDto,
  UpdateContributionDto,
} from './dto/contribution.dto';
import {
  CONTRIBUTION_ENTITY,
  Contribution,
} from './entities/contribution.entity';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';
import { Fingerprint, IFingerprint } from 'nestjs-fingerprint';
import { Owner } from 'src/decorators/owner.decorator';

@ApiTags('Contributions')
@Controller('contributions')
@Crud({
  model: {
    type: Contribution,
  },
  query: {
    limit: 100,
    join: {
      attachments: {
        eager: true,
      },
      student: {
        // TODO: check if is_anonymous
        eager: true,
      },
      semester: {
        eager: true,
      },
      'semester.faculty': {
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
  constructor(public service: ContributionsService) {}

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
      }),
    )
    attachments: Array<Express.Multer.File>,
  ) {
    return this.service.update(+id, dto, attachments);
  }

  @Delete(':id')
  @Roles(UserRole.STUDENT)
  @Owner(CONTRIBUTION_ENTITY, 'student_id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.FACULTY_MARKETING_COORDINATOR)
  approve(@Param('id') id: string) {
    return this.service.approve(+id);
  }

  @Patch(':id/select')
  @Roles(UserRole.FACULTY_MARKETING_COORDINATOR)
  select(@Param('id') id: string) {
    return this.service.select(+id);
  }

  @Patch(':id/evaluate')
  @Roles(UserRole.FACULTY_MARKETING_COORDINATOR)
  evaluate(@Param('id') id: string, @Body() dto: EvaluateDto) {
    return this.service.evaluate(+id, dto);
  }
}
