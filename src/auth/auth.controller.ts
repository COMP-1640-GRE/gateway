import { Body, Controller, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { LoginDto } from './auth.dto';
import { AuthService } from './auth.service';
import { CompleteAccountDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() { username, password }: LoginDto) {
    return this.authService.login(username, password);
  }

  @Public()
  @Patch('activate-account')
  activate(@Body() dto: CompleteAccountDto) {
    return this.authService.activate(dto);
  }
}
