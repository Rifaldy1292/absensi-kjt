import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ambil token dari header Authorization
      ignoreExpiration: false,
      secretOrKey: 'RAHASIA_JWT_LO', // samain dengan secret di auth.module.ts
    });
  }

  async validate(payload: any) {
    // payload = hasil decode JWT → biasanya { sub, username, iat, exp }
    return { userId: payload.sub, username: payload.username };
  }
}
