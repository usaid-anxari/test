import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization header');
    }
    const token = authHeader.split(' ')[1];
    try {
      const profile = await this.authService.getUserProfileFromToken(token);
      const userEntity = await this.authService.validateOrCreateUser(profile);

      // attach for controllers
      req.userProfile = profile;
      req.userEntity = userEntity;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token or unable to fetch profile: ' + (err?.message || err));
    }
  }
}
