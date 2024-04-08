import { Body, Controller, Get, Patch, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';
import { Public } from 'src/decorators/public.decorator';
import { AuthService } from './auth.service';
import { ActiveAccountDto, LoginDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(res, dto);
  }

  @Patch('activate-account')
  @Public()
  activate(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: ActiveAccountDto,
  ) {
    return this.authService.activate(res, dto);
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Get('introspect')
  introspect(@JwtPayload() user: JwtPayloadType) {
    return {
      authenticated: true,
      ...user,
    };
  }
}
