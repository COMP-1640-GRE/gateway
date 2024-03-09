import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { ListRequestDto } from 'src/utils/list.dto';
import { CreateUsersDto, UpdateAccountDto } from './dto/user.dto';
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
  update(@Body() dto: UpdateAccountDto, @JwtPayload() { id }: JwtPayloadType) {
    return this.userService.update({ id, ...dto });
  }
}
