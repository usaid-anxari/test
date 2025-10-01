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
    // Get all media assets for this business
    const mediaAssets = await this.mediaRepo.find({
      where: { businessId },
    });
    
    // Calculate total bytes used
    const bytesUsed = mediaAssets.reduce((total, asset) => {
      return total + (Number(asset.sizeBytes) || 0);
    }, 0);

    const reviewCount = await this.reviewsRepo.count({
      where: { businessId },
    });

    const mediaCount = mediaAssets.length;

    // Get storage limit from cache or use default
    const storageLimitGb = this.storageLimits.get(businessId) || 1; // Default to FREE tier
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
