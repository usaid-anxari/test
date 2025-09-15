import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { BusinessUser } from './entities/business-user.entity';
import { User } from '../users/entities/user.entity';
import { UnauthorizedError } from 'express-jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BusinessService {
  constructor(
    private userService: UsersService,
    @InjectRepository(Business) private bizRepo: Repository<Business>,
    @InjectRepository(BusinessUser) private buRepo: Repository<BusinessUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(dto: Partial<Business>) {
    const b = this.bizRepo.create(dto);
    return this.bizRepo.save(b);
  }

  async findBySlug(slug: string) {
    return this.bizRepo.findOne({ where: { slug } });
  }

  async findById(id: string) {
    return this.bizRepo.findOne({ where: { id } });
  }

  async addOwner(businessId: string, userId: string, isDefault: boolean) {
    const user = await this.userService.findById(userId);
    const business = await this.findById(businessId);

    if (!user || !business) {
      throw new Error('User or Business not found');
    }

    const bu = this.buRepo.create({
      user,
      business,
      role: 'owner',
      isDefault,
    });

    return this.buRepo.save(bu);
  }

  async requireUserBelongsToBusiness(userId: string, businessId: string) {
    const row = await this.buRepo.findOne({ where: { userId, businessId } });
    if (!row) throw new ForbiddenException('Cross-tenant access forbidden');
    return row;
  }

  // create business for a user and mark user active + attach owner row
  async createBusinessForUser(user: User, dto: any) {
    const slug = (dto.slug || dto.name).toLowerCase().replace(/\s+/g, '-');

    // ensure slug uniqueness (simple check)
    const existing = await this.findBySlug(slug);
    if (existing)
      throw new UnauthorizedException({ message: 'slug already taken' });

    const biz = this.bizRepo.create({
      name: dto.name,
      slug,
      logoUrl: dto.logoUrl,
      brandColor: dto.brandColor,
      website: dto.website,
      contactEmail: dto.contactEmail,
      settingsJson: dto.settingsJson || {},
    });
    const savedBiz = await this.bizRepo.save(biz);

    // attach owner
    await this.addOwner(savedBiz.id, user.id, true);

    // activate user
    user.isActive = true;
    await this.userRepo.save(user);

    return savedBiz;
  }

  async findDefaultForUser(userId: string) {
    const bu = await this.buRepo.findOne({
      where: { userId, isDefault: true },
    });
    if (!bu) return null;
    return this.findById(bu.businessId);
  }
}
