import { Body, Controller, Get, Patch, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { AuthService } from './auth.service';
import { ActiveAccountDto, LoginDto } from './dto/auth.dto';
import { REFRESH_TOKEN_KEY, TOKEN_KEY } from './jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(res, dto);
  }

  @Public()
  @Patch('activate-account')
  activate(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: ActiveAccountDto,
  ) {
    return this.authService.activate(res, dto);
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(TOKEN_KEY);
    res.clearCookie(REFRESH_TOKEN_KEY);

    return { message: 'Logged out' };
  }

  @Get('introspect')
  introspect() {
    return {
      authenticated: true,
    };
  }
}
