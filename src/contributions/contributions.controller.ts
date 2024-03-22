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
import { Crud } from '@nestjsx/crud';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ContributionsService } from './contributions.service';
import {
  CreateContributionDto,
  UpdateContributionDto,
} from './dto/contribution.dto';
import { Contribution } from './entities/contribution.entity';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';
import { Fingerprint, IFingerprint } from 'nestjs-fingerprint';

@ApiTags('Contributions')
@Controller('contributions')
@Crud({
  model: {
    type: Contribution,
  },
  query: {
    limit: 100,
    join: {
      faculty: {
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
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

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
    return this.contributionsService.create(userId, dto, attachments);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Fingerprint() fp: IFingerprint) {
    return this.contributionsService.findOne(+id, fp.id);
  }

  @Patch(':id')
  @Roles(UserRole.STUDENT)
  @ApiBody({ type: CreateContributionDto })
  @ApiConsumes('multipart/form-data')
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
    @JwtPayload() { id: userId }: JwtPayloadType,
  ) {
    return this.contributionsService.update(+id, userId, dto, attachments);
  }

  @Delete(':id')
  @Roles(UserRole.STUDENT)
  remove(
    @Param('id') id: string,
    @JwtPayload() { id: userId }: JwtPayloadType,
  ) {
    return this.contributionsService.remove(+id, userId);
  }
}
