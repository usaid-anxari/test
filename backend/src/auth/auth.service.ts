import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly auth0Domain: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    this.auth0Domain = this.configService.get<string>('AUTH0_DOMAIN') || '';
    if (!this.auth0Domain) {
      throw new Error('AUTH0_DOMAIN is not configured');
    }
  }

  async getUserProfileFromToken(token: string): Promise<any> {
    const url = `${this.auth0Domain.replace(/\/$/, '')}/userinfo`;
   console.log(url);
   
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60000,
      });
      console.log(response.data);
      return response.data;
      
    } catch (error) {
      this.logger.error('Failed to fetch user profile from Auth0', error);
      throw new Error('Unable to fetch user profile');
    }
  }

  async validateOrCreateUser(profile: any): Promise<User> {
    const auth0Id = profile.sub;
    if (!auth0Id) {
      throw new Error('Invalid Auth0 profile: missing sub field');
    }

    let user = await this.userRepo.findOne({ where: { auth0Id } });
    
    if (!user) {
      user = this.userRepo.create({
        auth0Id,
        email: profile.email || null,
        name: profile.name || profile.nickname || 'User',
        picture: profile.picture || null,
        isActive: false,
      });
      
      user = await this.userRepo.save(user);
      this.logger.log(`Created new user: ${user.id} (auth0: ${auth0Id})`);
    } else {
      const updates: Partial<User> = {};
      
      if (profile.email && profile.email !== user.email) {
        updates.email = profile.email;
      }
      
      const newName = profile.name || profile.nickname;
      if (newName && newName !== user.name) {
        updates.name = newName;
      }
      
      if (profile.picture && profile.picture !== user.picture) {
        updates.picture = profile.picture;
      }
      
      if (Object.keys(updates).length > 0) {
        Object.assign(user, updates);
        await this.userRepo.save(user);
        this.logger.log(`Updated user profile: ${user.id}`);
      }
    }
    
    return user;
  }
}