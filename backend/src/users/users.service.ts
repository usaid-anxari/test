import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BusinessUser } from '../business/entities/business-user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(BusinessUser) private buRepo: Repository<BusinessUser>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async updateUserStatus(userId: string, status: boolean) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = status;
    return this.usersRepo.save(user);
  }

  async findOrCreateFromAuth0Profile(profile: any): Promise<User> {
    // This method is similar to AuthService.validateOrCreateUser
    // kept for backwards compatibility if needed.
    const auth0Id = profile.sub;
    let user = await this.usersRepo.findOne({ where: { auth0Id } });
    if (!user) {
      user = this.usersRepo.create({
        auth0Id,
        email: profile.email,
        name: profile.name || profile.nickname,
        picture: profile.picture,
        isActive: false,
      });
      user = await this.usersRepo.save(user);
    } else {
      let changed = false;
      if (profile.email && user.email !== profile.email) {
        user.email = profile.email;
        changed = true;
      }
      if (
        (profile.name || profile.nickname) &&
        user.name !== (profile.name || profile.nickname)
      ) {
        user.name = profile.name || profile.nickname;
        changed = true;
      }
      if (profile.picture && user.picture !== profile.picture) {
        user.picture = profile.picture;
        changed = true;
      }
      if (changed) await this.usersRepo.save(user);
    }
    return user;
  }

  async findDefaultBusinessForUser(userId: string) {
    return this.buRepo.findOne({ where: { userId, isDefault: true } });
  }
}
