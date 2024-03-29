import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';
import { Owner } from 'src/decorators/owner.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import {
  AdminUpdateUserDto,
  ChangePasswordDto,
  CreateUsersDto,
  UpdateUserDto,
  UploadAvatarDto,
} from './dto/user.dto';
import { USER_ENTITY, User, UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@Crud({
  model: {
    type: User,
  },
  dto: {
    create: CreateUsersDto,
    update: UpdateUserDto,
  },
  query: {
    limit: 100,
    join: {
      faculty: {
        eager: true,
        required: false,
      },
    },
    cache: 200,
  },
  routes: {
    only: ['getManyBase', 'getOneBase', 'deleteOneBase'],
    getManyBase: {
      decorators: [Roles(UserRole.ADMINISTRATOR)],
    },
    deleteOneBase: {
      decorators: [
        Roles(UserRole.ADMINISTRATOR),
        Owner(USER_ENTITY, 'id', true),
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
export class UsersController implements CrudController<User> {
  constructor(public service: UsersService) {}

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  async createMultipleUsers(@Body() dto: CreateUsersDto) {
    return await this.service.createUsers(dto);
  }

  @Patch()
  update(@Body() dto: UpdateUserDto, @JwtPayload() { id }: JwtPayloadType) {
    return this.service.update({ id, ...dto });
  }

  @Post('avatar')
  @ApiBody({ type: UploadAvatarDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  avatar(
    @UploadedFile() file: Express.Multer.File,
    @JwtPayload() { id }: JwtPayloadType,
  ) {
    return this.service.avatar(id, file);
  }

  @Patch('change-password')
  changePassword(
    @Body() dto: ChangePasswordDto,
    @JwtPayload() { id }: JwtPayloadType,
  ) {
    return this.service.changePassword(+id, dto);
  }

  // TODO: send email or send a notification to the administrator to reset the password
  // @Post('forgot-password')
  // forgotPassword

  @Patch(':id/reset-password')
  @Roles(UserRole.ADMINISTRATOR)
  resetPassword(@Param('id') id: string) {
    return this.service.resetPassword(+id);
  }

  @Patch(':id/lock')
  @Roles(UserRole.ADMINISTRATOR)
  lockUser(@Param('id') userId: string, @JwtPayload() { id }: JwtPayloadType) {
    return this.service.lockUser(+userId, +id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR)
  @ApiOperation({ summary: 'Admin update a user' })
  adminUpdate(@Param('id') userId: string, @Body() dto: AdminUpdateUserDto) {
    return this.service.adminUpdate(+userId, dto);
  }
}
