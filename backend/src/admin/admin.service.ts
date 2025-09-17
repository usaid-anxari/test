import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from 'src/review/entities/review.entity';
import { BusinessService } from 'src/business/business.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
    private readonly bizService: BusinessService,
  ) {}

  // helper: format review with media
  private formatReview(r: Review) {
    const media = r.mediaAssets?.filter(
      (m) => m.assetType === 'video' || m.assetType === 'audio',
    ) || [];
    return {
      id: r.id,
      type: r.type,
      title: r.title,
      content: r.bodyText,
      status: r.status,
      reviewerName: r.reviewerName,
      rating: r.rating,
      publishedAt: r.publishedAt,
      contact: r.reviewerContactJson,
      submittedAt: r.submittedAt,
      media: media.map((m) => ({
        type: m.assetType,
        s3Key: m.s3Key,
      })),
    };
  }

  // list all reviews for a business (any status)
  async listAllForBusinessBySlug(slug: string, page = 1, limit = 25) {
    const biz = await this.bizService.findBySlug(slug);
    if (!biz) throw new NotFoundException('Business not found');

    const [rows, total] = await this.reviewsRepo.findAndCount({
      where: { businessId: biz.id },
      order: { submittedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['mediaAssets'],
    });

    return {
      total,
      page,
      limit,
      reviews: rows.map((r) => this.formatReview(r)),
    };
  }

  // get single review by id (ensure it belongs to business)
  async getReviewForBusiness(businessId: string, reviewId: string) {
    const r = await this.reviewsRepo.findOne({
      where: { id: reviewId, businessId },
      relations: ['mediaAssets'],
    });
    if (!r) throw new NotFoundException('Review not found');
    return this.formatReview(r);
  }

  // set status: 'approved'|'rejected'|'hidden'
  async setStatusForBusiness(
    businessId: string,
    reviewId: string,
    status: string,
  ) {
    const r = await this.reviewsRepo.findOne({
      where: { id: reviewId, businessId },
      relations: ['mediaAssets'],
    });

    if (!r) throw new NotFoundException('Review not found');

    const allowed = ['pending', 'approved', 'rejected', 'hidden'];
    if (!allowed.includes(status))
      throw new ForbiddenException('Invalid status');

    r.status = status as any;
    if (status === 'approved') r.publishedAt = new Date();
    if (status !== 'approved') r.publishedAt = null;

    const saved = await this.reviewsRepo.save(r);
    return this.formatReview(saved);
  }
}
