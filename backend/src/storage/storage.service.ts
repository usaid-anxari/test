import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaAsset } from '../review/entities/media-asset.entity';
import { Review } from '../review/entities/review.entity';

@Injectable()
export class StorageService {
  private storageLimits = new Map<string, number>(); // businessId -> limitGB

  constructor(
    @InjectRepository(MediaAsset)
    private readonly mediaRepo: Repository<MediaAsset>,
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
  ) {}

  async getUsageForBusiness(businessId: string) {
    // Use aggregation query for better performance
    const result = await this.mediaRepo
      .createQueryBuilder('media')
      .select('SUM(CAST(media.sizeBytes AS BIGINT))', 'totalBytes')
      .addSelect('COUNT(*)', 'mediaCount')
      .where('media.businessId = :businessId', { businessId })
      .getRawOne();

    const bytesUsed = Number(result?.totalBytes) || 0;
    const mediaCount = Number(result?.mediaCount) || 0;

    // Quick count query for reviews
    const reviewCount = await this.reviewsRepo.count({
      where: { businessId },
    });

    // Get storage limit from cache or use default
    const storageLimitGb = this.storageLimits.get(businessId) || 1;
    const bytesLimit = storageLimitGb * 1024 * 1024 * 1024;

    return {
      bytesUsed,
      bytesLimit,
      reviewCount,
      mediaCount,
    };
  }

  async updateStorageLimit(businessId: string, limitGb: number): Promise<void> {
    console.log(`Updating storage limit for business ${businessId}: ${limitGb}GB`);
    this.storageLimits.set(businessId, limitGb);
  }

  getStorageLimit(businessId: string): number {
    return this.storageLimits.get(businessId) || 1; // Default to 1GB (FREE tier)
  }
}
