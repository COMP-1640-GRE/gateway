import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request as RequestType } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export const TOKEN_KEY = 'access_token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
    });
  }

  static extractJWT(req: RequestType): string | null {
    if (
      req.cookies &&
      TOKEN_KEY in req.cookies &&
      req.cookies[TOKEN_KEY].length > 0
    ) {
      return req.cookies[TOKEN_KEY];
    }
    return null;
  }
}
