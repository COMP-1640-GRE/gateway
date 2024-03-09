import { Body, Controller, Get, Patch, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { AuthService } from './auth.service';
import { CompleteAccountDto, LoginDto } from './dto/auth.dto';
import { Response } from 'express';
import { TOKEN_KEY } from './jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() { username, password }: LoginDto,
  ) {
    return this.authService.login(res, username, password);
  }

  @Public()
  @Patch('activate-account')
  activate(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CompleteAccountDto,
  ) {
    return this.authService.activate(res, dto);
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(TOKEN_KEY);
    return { message: 'Logged out' };
  }
}
