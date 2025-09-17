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

  async findDefaultBusinessForUser(userId: string) {
    return this.buRepo.findOne({ 
      where: { userId, isDefault: true },
      relations: ['business']
    });
  }
}