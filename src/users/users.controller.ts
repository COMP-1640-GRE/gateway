import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { ListRequestDto } from 'src/utils/list.dto';
import { CreateUsersDto } from './dto/user.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

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
}
