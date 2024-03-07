import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() { username, password }: LoginDto) {
    return this.authService.login(username, password);
  }
}
