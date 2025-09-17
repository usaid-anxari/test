import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaAsset } from '../review/entities/media-asset.entity';
import { Review } from '../review/entities/review.entity';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(MediaAsset)
    private readonly mediaRepo: Repository<MediaAsset>,
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
  ) {}

  async getUsageForBusiness(businessId: string) {
    const [{ sum }] = await this.mediaRepo
      .createQueryBuilder('m')
      .select('COALESCE(SUM(m.size_bytes), 0)', 'sum')
      .where('m.business_id = :bid', { bid: businessId })
      .getRawMany();

    const reviewCount = await this.reviewsRepo.count({
      where: { businessId },
    });

    const mediaCount = await this.mediaRepo.count({
      where: { businessId },
    });

    // For now, static limit (1 GB), later can pull from plan
    const bytesLimit = 1024 * 1024 * 1024;

    return {
      bytesUsed: Number(sum) || 0,
      bytesLimit,
      reviewCount,
      mediaCount,
    };
  }
}
