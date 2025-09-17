import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const domain = configService.get('AUTH0_DOMAIN');
    const audience = configService.get('AUTH0_AUDIENCE');
    
    if (!domain || !audience) {
      throw new Error('AUTH0_DOMAIN and AUTH0_AUDIENCE must be configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: audience,
      issuer: `${domain.replace(/\/$/, '')}/`,
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${domain.replace(/\/$/, '')}/.well-known/jwks.json`,
      }) as any,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}