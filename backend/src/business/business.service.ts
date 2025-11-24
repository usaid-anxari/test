import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, MoreThan } from 'typeorm';
import { Business } from './entities/business.entity';
import { BusinessUser } from './entities/business-user.entity';
import { User } from '../users/entities/user.entity';
import { Review } from '../review/entities/review.entity';
import { MediaAsset } from '../review/entities/media-asset.entity';
import { ConsentLog } from '../review/entities/consent-log.entity';
import { GoogleReview } from '../google/entities/google-review.entity';
import { S3Service } from '../common/s3/s3.service';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(
    @InjectRepository(Business) private businessRepo: Repository<Business>,
    @InjectRepository(BusinessUser) private businessUserRepo: Repository<BusinessUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(MediaAsset) private mediaRepo: Repository<MediaAsset>,
    @InjectRepository(ConsentLog) private consentRepo: Repository<ConsentLog>,
    @InjectRepository(GoogleReview) private googleReviewRepo: Repository<GoogleReview>,
    private s3Service: S3Service,
  ) { }

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

  async hasExistingBusiness(userId: string): Promise<boolean> {
    const count = await this.businessUserRepo.count({
      where: { userId }
    });
    return count > 0;
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
      .select([
        'r.id', 'r.type', 'r.title', 'r.bodyText', 'r.rating',
        'r.reviewerName', 'r.publishedAt'
      ])
      .leftJoin('r.mediaAssets', 'm')
      .addSelect(['m.id', 'm.assetType', 'm.s3Key', 'm.durationSec'])
      .where('r.businessId = :businessId', { businessId: business.id })
      .andWhere('r.status = :status', { status: 'approved' });

    // Note: Text reviews are always enabled for widgets to ensure content availability
    // Business setting textReviewsEnabled only affects the review submission form
    // Widgets should show all approved reviews regardless of this setting

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

    this.logger.log(`Found ${reviews.length} approved reviews for business ${business.slug}`);
    this.logger.log(`Review types: ${reviews.map(r => r.type).join(', ')}`);

    // Return S3 keys only (frontend will handle URL generation)
    const reviewsWithMedia = reviews.map((review) => {
      const mediaAssets = (review.mediaAssets || []).map((asset) => ({
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
        mediaAssets,
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
      mediaAssets: [],
    }));

    const allReviews = [...reviewsWithMedia, ...googleReviewsFormatted];
    this.logger.log(`Total reviews returned: ${allReviews.length}`);

    return {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        description: business.description,
        industry: business.industry,
        website: business.website,
        contactEmail: business.contactEmail,
        phone: business.phone,
        address: business.address,
        city: business.city,
        state: business.state,
        country: business.country,
        postalCode: business.postalCode,
        companySize: business.companySize,
        foundedYear: business.foundedYear,
        logoUrl: business.logoUrl,
        bannerUrl: business.bannerUrl,
        brandColor: business.brandColor,
        businessHours: business.businessHours,
        socialLinks: business.socialLinks,
        isVerified: business.isVerified,
        textReviewsEnabled: business.settingsJson?.textReviewsEnabled ?? true,
        googleReviewsEnabled: business.settingsJson?.googleReviewsEnabled ?? false,
        googlePlaceId: business.settingsJson?.googlePlaceId || null,
        createdAt: business.createdAt,
      },
      reviews: allReviews,
      stats: {
        totalReviews: allReviews.length,
        videoReviews: reviewsWithMedia.filter(r => r.type === 'video').length,
        audioReviews: reviewsWithMedia.filter(r => r.type === 'audio').length,
        textReviews: reviewsWithMedia.filter(r => r.type === 'text').length,
        googleReviews: googleReviewsFormatted.length,
        averageRating: this.calculateAverageRating(allReviews),
      },
    };
  }

  // Get all reviews for business (for dashboard - includes pending, approved, rejected)
  async getAllReviewsForBusiness(businessId: string) {
    const reviews = await this.reviewRepo
      .createQueryBuilder('r')
      .select([
        'r.id', 'r.type', 'r.status', 'r.title', 'r.bodyText', 'r.rating',
        'r.reviewerName', 'r.submittedAt', 'r.publishedAt'
      ])
      .leftJoin('r.mediaAssets', 'm')
      .addSelect(['m.id', 'm.assetType', 'm.s3Key', 'm.durationSec', 'm.sizeBytes'])
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

  private calculateAverageRating(reviews: any[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  // Auto-verify business when profile is complete
  async checkAndAutoVerify(businessId: string): Promise<void> {
    const business = await this.findById(businessId);
    if (!business || business.isVerified) return;

    // Required fields for verification
    const requiredFields = [
      business.name,
      business.description,
      business.industry,
      business.website,
      business.contactEmail,
      business.phone,
      business.address,
      business.city,
      business.country
    ];

    // Check if all required fields are filled
    const isComplete = requiredFields.every(field => field && field.trim().length > 0);

    if (isComplete) {
      await this.businessRepo.update(businessId, { isVerified: true });
      this.logger.log(`Business ${businessId} auto-verified - profile complete`);
    }
  }

  // NO CACHE: Single query for dashboard - immediate updates
  async findDefaultForUserWithReviews(userId: string): Promise<{ business: Business; reviews: any[] } | null> {
    const businessUser = await this.businessUserRepo.findOne({
      where: { userId, isDefault: true },
      relations: ['business'],
    });

    if (!businessUser?.business) {
      return null;
    }

    const business = businessUser.business;
     
    // Single optimized query for all reviews with media
    const reviews = await this.reviewRepo
      .createQueryBuilder('r')
      .select([
        'r.id', 'r.type', 'r.status', 'r.title', 'r.bodyText', 'r.rating',
        'r.reviewerName', 'r.submittedAt', 'r.publishedAt'
      ])
      .leftJoinAndSelect('r.mediaAssets', 'm')
      .where('r.businessId = :businessId', { businessId: business.id })
      .orderBy('r.submittedAt', 'DESC')
      .limit(100)
      .getMany();

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      type: review.type,
      status: review.status,
      title: review.title,
      bodyText: review.bodyText,
      rating: review.rating,
      reviewerName: review.reviewerName,
      submittedAt: review.submittedAt,
      publishedAt: review.publishedAt,
      mediaAssets: (review.mediaAssets || []).map((asset) => ({
        id: asset.id,
        assetType: asset.assetType,
        s3Key: asset.s3Key,
        durationSec: asset.durationSec,
        sizeBytes: asset.sizeBytes,
      })),
    }));

    return { business, reviews: formattedReviews };
  }

  // Simple in-memory cache helpers
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  private setInCache(key: string, data: any, ttlMs: number = this.CACHE_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Clean cache periodically
    if (this.cache.size > 100) {
      this.cleanCache();
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  // Clear user-specific cache
  async clearUserCache(userId: string): Promise<void> {
    const cacheKey = `dashboard:${userId}`;
    this.cache.delete(cacheKey);
  }

  // Get fresh unread notification count (no cache)
  async getFreshUnreadCount(businessId: string, lastViewedAt?: Date): Promise<number> {
    const count = await this.reviewRepo.count({
      where: {
        businessId,
        status: 'pending',
        submittedAt: lastViewedAt ? MoreThan(lastViewedAt) : undefined
      }
    });
    return count;
  }

  // Mark notifications as read
  async markNotificationsAsRead(businessId: string): Promise<void> {
    await this.businessRepo.update(businessId, { 
      lastViewedAt: new Date() 
    });
    this.logger.log(`Notifications marked as read for business ${businessId}`);
  }

  // Get unread notifications (pending reviews only)
  async getUnreadNotifications(businessId: string, lastViewedAt?: Date) {
    const reviews = await this.reviewRepo
      .createQueryBuilder('r')
      .select([
        'r.id', 'r.type', 'r.title', 'r.rating',
        'r.reviewerName', 'r.submittedAt'
      ])
      .where('r.businessId = :businessId', { businessId })
      .andWhere('r.status = :status', { status: 'pending' })
      .andWhere(lastViewedAt ? 'r.submittedAt > :lastViewedAt' : '1=1', { lastViewedAt })
      .orderBy('r.submittedAt', 'DESC')
      .getMany();

    const count = reviews.length;

    return {
      count,
      reviews: reviews.map(r => ({
        id: r.id,
        type: r.type,
        title: r.title,
        rating: r.rating,
        reviewerName: r.reviewerName,
        submittedAt: r.submittedAt
      }))
    };
  }

  // Right-to-delete functionality (Milestone 9)
  async deleteReviewPermanently(businessId: string, reviewId: string, ip?: string) {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId, businessId },
      relations: ['mediaAssets']
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Delete media assets from S3
    for (const asset of review.mediaAssets || []) {
      try {
        await this.s3Service.deleteFile(asset.s3Key);
        this.logger.log(`Deleted S3 file: ${asset.s3Key}`);
      } catch (error) {
        this.logger.warn(`Failed to delete S3 file ${asset.s3Key}:`, error.message);
      }
    }

    // Delete media assets from database first (foreign key constraint)
    await this.mediaRepo.delete({ reviewId });

    // Log consent deletion
    const consentLog = this.consentRepo.create({
      businessId,
      reviewId,
      action: 'DELETE_REVIEW',
      consentText: 'Right-to-delete request processed',
      ip: ip || 'unknown',
      userAgent: 'system',
      consentCheckedAt: new Date(),
    });
    await this.consentRepo.save(consentLog);

    // Delete review
    await this.reviewRepo.delete({ id: reviewId });

    this.logger.log(`✅ Permanently deleted review ${reviewId} for business ${businessId}`);
    return { message: 'Review permanently deleted' };
  }

  // Get consent logs (Milestone 9)
  async getConsentLogs(businessId: string) {
    return await this.consentRepo.find({
      where: { businessId },
      order: { consentCheckedAt: 'DESC' },
      take: 100 // Limit for performance
    });
  }

  async getAllBusinesses(): Promise<Business[]> {
    return await this.businessRepo.find({
      where: { deletedAt: IsNull() },
      select: ['id', 'name', 'slug', 'description', 'industry', 'logoUrl', 'city', 'country', 'isVerified', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
  }
}