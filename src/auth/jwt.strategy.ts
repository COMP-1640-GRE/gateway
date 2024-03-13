import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request as RequestType } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

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
    return JwtStrategy.extractCookies(req, TOKEN_KEY);
  }

  static extractCookies(req: RequestType, cookieName: string): string | null {
    if (
      req.cookies &&
      cookieName in req.cookies &&
      req.cookies[cookieName].length > 0
    ) {
      return req.cookies[cookieName];
    }
    return null;
  }
}
