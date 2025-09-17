import { 
  CanActivate, 
  ExecutionContext, 
  Injectable, 
  UnauthorizedException,
  Logger 
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private profileCache = new Map<string, { profile: any; user: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const cached = this.profileCache.get(token);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
        req.userProfile = cached.profile;
        req.userEntity = cached.user;
        return true;
      }
      
      const profile = await this.authService.getUserProfileFromToken(token);
      const userEntity = await this.authService.validateOrCreateUser(profile);
      
      this.profileCache.set(token, {
        profile,
        user: userEntity,
        timestamp: now
      });
      
      if (this.profileCache.size > 100) {
        this.cleanCache();
      }
      
      req.userProfile = profile;
      req.userEntity = userEntity;
      
      return true;
    } catch (err) {
      this.logger.error('JWT validation failed', err);
      throw new UnauthorizedException(
        'Invalid token or unable to fetch profile'
      );
    }
  }
  
  private cleanCache(): void {
    const now = Date.now();
    for (const [token, data] of this.profileCache.entries()) {
      if (now - data.timestamp > this.CACHE_TTL) {
        this.profileCache.delete(token);
      }
    }
  }
}