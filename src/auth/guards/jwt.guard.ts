import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayloadType } from 'src/decorators/jwt-payload.decorator';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { UsersService } from 'src/users/users.service';
import { JwtStrategy, REFRESH_TOKEN_KEY } from '../jwt.strategy';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = JwtStrategy.extractJWT(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    let payload: JwtPayloadType;

    try {
      const { id } = this.jwtService.decode(token);
      const { secret } = await this.usersService.findById(id);
      payload = await this.jwtService.verifyAsync(token, { secret });
    } catch (error) {
      const refreshToken = JwtStrategy.extractCookies(
        request,
        REFRESH_TOKEN_KEY,
      );

      if (refreshToken) {
        try {
          const { id } = this.jwtService.decode(refreshToken);
          const { secret } = await this.usersService.findById(id);
          payload = await this.jwtService.verifyAsync(refreshToken, {
            secret,
          });
        } catch (error) {
          throw new UnauthorizedException();
        }
      } else {
        throw new UnauthorizedException();
      }
    }

    request['user'] = payload;
    return true;
  }
}
