import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    console.log(configService.get('AUTH0_AUDIENCE'));

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // audience should match the "Identifier" you set for your Auth0 API
      audience: configService.get('AUTH0_AUDIENCE'),
      issuer: `${configService.get('AUTH0_DOMAIN').replace(/\/$/, '')}/`,
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService
          .get('AUTH0_DOMAIN')
          .replace(/\/$/, '')}/.well-known/jwks.json`,
      }) as any,
    });
  }

  // payload is the decoded JWT claims (sub, aud, iss, scope, etc.)
  async validate(payload: any) {
    // return the raw claims to be available in req.user
    return payload;
  }
}
