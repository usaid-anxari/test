import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { MediaAsset } from './entities/media-asset.entity';
import { TranscodeJob } from './entities/transcode-job.entity';
import { ConsentLog } from './entities/consent-log.entity';
import { Business } from '../business/entities/business.entity';
import { S3Service } from '../common/s3/s3.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
    @InjectRepository(MediaAsset) private mediaRepo: Repository<MediaAsset>,
    @InjectRepository(TranscodeJob) private jobsRepo: Repository<TranscodeJob>,
    @InjectRepository(ConsentLog) private consentRepo: Repository<ConsentLog>,
    @InjectRepository(Business) private bizRepo: Repository<Business>,
    private s3: S3Service,
  ) {}

  async findOneById(id: string): Promise<Review> {
    const review = await this.reviewsRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  async createMediaAssetAndAttach(
    biz: Business,
    review: Review,
    data: {
      s3Key: string;
      assetType: string;
      metadataJson?: any;
    },
  ): Promise<MediaAsset> {
    const asset = this.mediaRepo.create({
      businessId: biz.id,
      reviewId: review.id,
      s3Key: data.s3Key,
      assetType: data.assetType,
      metadataJson: data.metadataJson ?? {},
    });

    return await this.mediaRepo.save(asset);
  }

  async findBusinessBySlug(slug: string) {
    return this.bizRepo.findOne({ where: { slug } });
  }

  // Creates review entry (for text or for file; file flow will call upload separately)
  async createReviewForBusiness(biz: Business, dto: CreateReviewDto, ip?: string, userAgent?: string) {
    if (!dto.consentChecked) {
      throw new BadRequestException(
        'Consent is required before submitting a review',
      );
    }
    const r = this.reviewsRepo.create({
      businessId: biz.id,
      type: dto.type,
      status: 'pending',
      title: dto.title,
      bodyText: dto.bodyText,
      rating: dto.rating,
      reviewerName: dto.reviewerName,
      consentChecked: dto.consentChecked,
      source: 'public',
      submittedAt: new Date(),
    });
    const savedReview = await this.reviewsRepo.save(r);
    
    // Log consent automatically (Milestone 9 compliance)
    await this.logConsent(
      biz.id,
      savedReview.id,
      `I agree to record my review and allow ${biz.name} to use it publicly.`,
      ip,
      userAgent
    );
    
    return savedReview;
  }

  // Upload file (stream) to S3, create media asset and transcode job
  async uploadFileAndAttach(
    biz: Business,
    review: Review,
    fileStream: NodeJS.ReadableStream,
    fileMeta: { originalname: string; mimetype?: string; size?: number },
  ) {
    const ext = path.extname(fileMeta.originalname) || '';
    const safeName = `${Date.now()}-${uuidv4()}${ext}`;
    const s3Key = `businesses/${biz.id}/reviews/${review.id}/${safeName}`;

    // upload
    const res = await this.s3.uploadStream(
      s3Key,
      fileStream as any,
      fileMeta.size,
      fileMeta.mimetype,
    );
    this.logger.log(`Uploaded file to s3 key=${s3Key}`);

    // create media asset
    const asset = this.mediaRepo.create({
      businessId: biz.id,
      reviewId: review.id,
      assetType: review.type,
      s3Key,
      sizeBytes: fileMeta.size,
      metadataJson: {
        originalName: fileMeta.originalname,
        mime: fileMeta.mimetype,
      },
    });
    const savedAsset = await this.mediaRepo.save(asset);

    // enqueue transcode job for videos (or audio if needed)
    if (review.type === 'video') {
      const job = this.jobsRepo.create({
        businessId: biz.id,
        reviewId: review.id,
        inputAssetId: savedAsset.id,
        target: '720p-h264-1mbps',
        status: 'queued',
      });
      await this.jobsRepo.save(job);
    }

    return savedAsset;
  }

  async getApprovedReviewsWithMedia(slug: string, page: number, limit: number) {
    const biz = await this.findBusinessBySlug(slug);
    if (!biz) throw new NotFoundException('Business not found');

    const qb = this.reviewsRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.mediaAssets', 'm')
      .where('r.business_id = :bizId', { bizId: biz.id })
      .andWhere('r.status = :status', { status: 'approved' })
      .orderBy('r.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      total,
      page,
      limit,
      reviews: rows.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        bodyText: r.bodyText,
        rating: r.rating,
        reviewerName: r.reviewerName,
        publishedAt: r.publishedAt,
        media:
          r.mediaAssets
            ?.filter((m) => m.assetType === 'video' || m.assetType === 'audio')
            .map((m) => ({
              type: m.assetType,
              s3Key: m.s3Key,
            })) || [],
      })),
    };
  }

  // Right-to-delete endpoint (Milestone 9 - GDPR compliance)
  async deleteReviewPermanently(businessId: string, reviewId: string, ip?: string) {
    const review = await this.reviewsRepo.findOne({
      where: { id: reviewId, businessId },
      relations: ['mediaAssets']
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Delete media assets from S3
    for (const asset of review.mediaAssets || []) {
      try {
        await this.s3.deleteFile(asset.s3Key);
        this.logger.log(`Deleted S3 file: ${asset.s3Key}`);
      } catch (error) {
        this.logger.warn(`Failed to delete S3 file ${asset.s3Key}:`, error.message);
      }
    }

    // Log consent deletion
    const consentLog = this.consentRepo.create({
      businessId,
      reviewId,
      consentText: 'Right-to-delete request processed',
      ip: ip || 'unknown',
      userAgent: 'system',
      consentCheckedAt: new Date(),
    });
    await this.consentRepo.save(consentLog);

    // Delete review and related data
    await this.reviewsRepo.remove(review);

    this.logger.log(`✅ Permanently deleted review ${reviewId} for business ${businessId}`);
    return { message: 'Review permanently deleted' };
  }

  // Log consent (Milestone 9)
  async logConsent(businessId: string, reviewId: string, consentText: string, ip?: string, userAgent?: string) {
    const consentLog = this.consentRepo.create({
      businessId,
      reviewId,
      consentText,
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown',
      consentCheckedAt: new Date(),
    });
    return await this.consentRepo.save(consentLog);
  }
}
