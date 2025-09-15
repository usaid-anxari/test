import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Call Auth0 /userinfo with the access token to get profile
  async getUserProfileFromToken(token: string): Promise<any> {
    const domain = this.configService.get<string>('AUTH0_DOMAIN');
    if (!domain) throw new Error('AUTH0_DOMAIN not set');

    const url = domain.replace(/\/$/, '') + '/userinfo';

    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return resp.data;
  }

  // Ensure user exists in DB and returns the User entity
  async validateOrCreateUser(profile: any): Promise<User> {
    const auth0Id = profile.sub;
    if (!auth0Id) throw new Error('profile.sub missing');

    let user = await this.userRepo.findOne({ where: { auth0Id } });
    if (!user) {
      user = this.userRepo.create({
        auth0Id,
        email: profile.email,
        name: profile.name || profile.nickname,
        picture: profile.picture,
        isActive: false,
      });
      user = await this.userRepo.save(user);
      this.logger.log(`Created new user id=${user.id} auth0Id=${auth0Id}`);
    } else {
      let changed = false;
      if (profile.email && user.email !== profile.email) { user.email = profile.email; changed = true; }
      if ((profile.name || profile.nickname) && user.name !== (profile.name || profile.nickname)) { user.name = profile.name || profile.nickname; changed = true; }
      if (profile.picture && user.picture !== profile.picture) { user.picture = profile.picture; changed = true; }
      if (changed) {
        await this.userRepo.save(user);
        this.logger.log(`Updated user id=${user.id}`);
      }
    }
    return user;
  }
}
