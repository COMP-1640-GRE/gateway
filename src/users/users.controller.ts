import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { ListRequestDto } from 'src/utils/list.dto';
import {
  AdminUpdateUserDto,
  ChangePasswordDto,
  CreateUsersDto,
  UpdateUserDto,
} from './dto/user.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('creates')
  @Roles(UserRole.ADMINISTRATOR)
  async createMultipleUsers(@Body() dto: CreateUsersDto) {
    return await this.userService.createUsers(dto);
  }

  @Get()
  @Roles(UserRole.ADMINISTRATOR)
  findAll(@Query() dto: ListRequestDto) {
    return this.userService.findAll(dto);
  }

  @Patch()
  update(@Body() dto: UpdateUserDto, @JwtPayload() { id }: JwtPayloadType) {
    return this.userService.update({ id, ...dto });
  }

  // TODO: find one user that can list all it's paginated contributions.
  // @Get(':username')
  // findByUsername(@Param('id') username: string) {
  //   return this.userService.findOneByUsername(username);
  // }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR)
  remove(@Param('id') userId: string, @JwtPayload() { id }: JwtPayloadType) {
    return this.userService.remove(+id, +userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR)
  adminUpdate(@Param('id') userId: string, @Body() dto: AdminUpdateUserDto) {
    return this.userService.adminUpdate(+userId, dto);
  }

  @Post('change-password')
  changePassword(
    @Body() dto: ChangePasswordDto,
    @JwtPayload() { id }: JwtPayloadType,
  ) {
    return this.userService.changePassword(+id, dto);
  }

  // TODO: send email or send a notification to the administrator to reset the password
  // @Post('forgot-password')
  // forgotPassword

  @Post('reset-password/:id')
  @Roles(UserRole.ADMINISTRATOR)
  resetPassword(@Param('id') id: string) {
    return this.userService.resetPassword(+id);
  }
}
