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
import { Review } from '../review/entities/review.entity';
import { MediaAsset } from '../review/entities/media-asset.entity';
import { GoogleReview } from '../google/entities/google-review.entity';
import { S3Service } from '../common/s3/s3.service';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(BusinessUser) private businessUserRepo: Repository<BusinessUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(MediaAsset) private mediaRepo: Repository<MediaAsset>,
    @InjectRepository(GoogleReview) private googleReviewRepo: Repository<GoogleReview>,
    private s3Service: S3Service,
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

  // Milestone 4: Public profile with prioritized approved reviews
  async getPublicProfileWithReviews(slug: string) {
    const business = await this.findBySlug(slug);
    if (!business) return null;

    // Get approved reviews with media assets, prioritized: video → audio → text
    const queryBuilder = this.reviewRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.mediaAssets', 'm')
      .where('r.businessId = :businessId', { businessId: business.id })
      .andWhere('r.status = :status', { status: 'approved' });
    
    // Milestone 5: Filter text reviews if disabled
    const textEnabled = business.settingsJson?.textReviewsEnabled ?? true;
    if (!textEnabled) {
      queryBuilder.andWhere('r.type != :textType', { textType: 'text' });
    }
    
    const reviews = await queryBuilder
      .orderBy(
        `CASE 
          WHEN r.type = 'video' THEN 1 
          WHEN r.type = 'audio' THEN 2 
          WHEN r.type = 'text' THEN 3 
          ELSE 4 
        END`
      )
      .addOrderBy('r.publishedAt', 'DESC')
      .getMany();

    // Return S3 keys only (frontend will handle URL generation)
    const reviewsWithMedia = reviews.map((review) => {
      const media = (review.mediaAssets || []).map((asset) => ({
        id: asset.id,
        type: asset.assetType,
        s3Key: asset.s3Key,
        durationSec: asset.durationSec,
      }));

      return {
        id: review.id,
        type: review.type,
        title: review.title,
        bodyText: review.bodyText,
        rating: review.rating,
        reviewerName: review.reviewerName,
        publishedAt: review.publishedAt,
        media,
      };
    });

    // Milestone 6: Get Google reviews
    const googleReviews = await this.googleReviewRepo.find({
      where: { businessId: business.id },
      order: { reviewedAt: 'DESC' },
    });

    const googleReviewsFormatted = googleReviews.map(review => ({
      id: review.id,
      type: 'google',
      title: `${review.rating} star review`,
      bodyText: review.text,
      rating: review.rating,
      reviewerName: review.reviewerName,
      publishedAt: review.reviewedAt,
      media: [],
    }));

    return {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        logoUrl: business.logoUrl,
        brandColor: business.brandColor,
        website: business.website,
        contactEmail: business.contactEmail,
        textReviewsEnabled: business.settingsJson?.textReviewsEnabled ?? true,
        googleReviewsEnabled: business.settingsJson?.googleReviewsEnabled ?? false,
        googlePlaceId: business.settingsJson?.googlePlaceId || null,
      },
      reviews: [...reviewsWithMedia, ...googleReviewsFormatted],
      stats: {
        totalReviews: reviewsWithMedia.length + googleReviewsFormatted.length,
        videoReviews: reviewsWithMedia.filter(r => r.type === 'video').length,
        audioReviews: reviewsWithMedia.filter(r => r.type === 'audio').length,
        textReviews: reviewsWithMedia.filter(r => r.type === 'text').length,
        googleReviews: googleReviewsFormatted.length,
      },
    };
  }

  // Get all reviews for business (for dashboard - includes pending, approved, rejected)
  async getAllReviewsForBusiness(businessId: string) {
    const reviews = await this.reviewRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.mediaAssets', 'm')
      .where('r.businessId = :businessId', { businessId })
      .orderBy('r.submittedAt', 'DESC')
      .getMany();

    return reviews.map((review) => {
      const mediaAssets = (review.mediaAssets || []).map((asset) => ({
        id: asset.id,
        assetType: asset.assetType,
        s3Key: asset.s3Key,
        durationSec: asset.durationSec,
        sizeBytes: asset.sizeBytes,
      }));

      return {
        id: review.id,
        type: review.type,
        status: review.status,
        title: review.title,
        bodyText: review.bodyText,
        rating: review.rating,
        reviewerName: review.reviewerName,
        submittedAt: review.submittedAt,
        publishedAt: review.publishedAt,
        mediaAssets,
      };
    });
  }

  // Update business information (excluding slug)
  async updateBusiness(businessId: string, updateData: Partial<Business>): Promise<Business> {
    const business = await this.findById(businessId);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Prevent slug updates
    delete updateData.slug;
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.deletedAt;

    Object.assign(business, updateData);
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