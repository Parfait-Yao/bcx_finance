import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';

// Stratégie JWT : extrait et valide l'access token sur chaque requête protégée
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'access_secret',
    });
  }

  // Le retour de validate() devient `request.user`
  async validate(payload: { sub: string; telephone: string }) {
    return { userId: payload.sub, telephone: payload.telephone };
  }
}
