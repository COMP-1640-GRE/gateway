import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateUsersDto } from './dto/user.dto';
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles(UserRole.ADMINISTRATOR)
  @Post('creates')
  async createMultipleUsers(@Body() dto: CreateUsersDto) {
    return await this.userService.createUsers(dto);
  }
}
