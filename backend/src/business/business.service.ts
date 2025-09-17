import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { BusinessUser } from './entities/business-user.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(BusinessUser) private businessUserRepo: Repository<BusinessUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(dto: Partial<Business>): Promise<Business> {
    if (dto.slug) {
      const existing = await this.businessRepo.findOne({ 
        where: { slug: dto.slug } 
      });
      if (existing) {
        throw new ConflictException('Business slug already exists');
      }
    }

    const business = this.businessRepo.create(dto);
    return this.businessRepo.save(business);
  }

  async findBySlug(slug: string): Promise<Business | null> {
    return this.businessRepo.findOne({ 
      where: { slug, deletedAt: IsNull() } 
    });
  }

  async findById(id: string): Promise<Business | null> {
    return this.businessRepo.findOne({ 
      where: { id, deletedAt: IsNull() } 
    });
  }

  async addOwner(
    businessId: string, 
    userId: string, 
    isDefault: boolean
  ): Promise<BusinessUser> {
    const existing = await this.businessUserRepo.findOne({
      where: { businessId, userId }
    });
    
    if (existing) {
      existing.role = 'owner';
      existing.isDefault = isDefault;
      return this.businessUserRepo.save(existing);
    }

    const businessUser = this.businessUserRepo.create({
      businessId,
      userId,
      role: 'owner',
      isDefault,
    });

    const saved = await this.businessUserRepo.save(businessUser);
    this.logger.log(`User ${userId} added as owner of business ${businessId}`);
    
    return saved;
  }

  async requireUserBelongsToBusiness(
    userId: string, 
    businessId: string
  ): Promise<BusinessUser> {
    const relationship = await this.businessUserRepo.findOne({ 
      where: { userId, businessId } 
    });
    
    if (!relationship) {
      throw new ForbiddenException('Access denied: user not associated with business');
    }
    
    return relationship;
  }

  async findDefaultForUser(userId: string): Promise<Business | null> {
    const businessUser = await this.businessUserRepo.findOne({
      where: { userId, isDefault: true },
      relations: ['business'],
    });
    
    return businessUser?.business || null;
  }

  async getBusinessesForUser(userId: string): Promise<Business[]> {
    const relationships = await this.businessUserRepo.find({
      where: { userId },
      relations: ['business'],
    });
    
    return relationships
      .map(r => r.business)
      .filter(b => b && !b.deletedAt);
  }

  async updateBusinessSettings(
    businessId: string,
    userId: string,
    settings: any
  ): Promise<Business> {
    await this.requireUserBelongsToBusiness(userId, businessId);
    
    const business = await this.findById(businessId);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    business.settingsJson = {
      ...business.settingsJson,
      ...settings,
    };

    return this.businessRepo.save(business);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}