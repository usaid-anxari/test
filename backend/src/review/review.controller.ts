import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
  NotFoundException,
  Get,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReviewsService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { diskStorage } from 'multer';
import { multerOptionsMemory } from '../common/multer/memory-storage';
import { Readable } from 'stream';
import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';
import { MediaAsset } from './entities/media-asset.entity';
import { BillingService } from '../billing/billing.service';

@ApiTags('public-reviews')
@Controller('api/public')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly billingService: BillingService,
  ) {}

  // Single endpoint to accept text or file + form fields.
  // Use multipart/form-data if file is included.
  @Post(':slug/reviews')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['text', 'video', 'audio'] },
        title: { type: 'string' },
        bodyText: { type: 'string' },
        rating: { type: 'integer' },
        reviewerName: { type: 'string' },
        consentChecked: { type: 'boolean' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor(
      'file',
      multerOptionsMemory({ maxFileSize: 200 * 1024 * 1024 }),
    ),
  ) // 200MB cap
  @HttpCode(HttpStatus.CREATED)
  async submitReview(
    @Param('slug') slug: string,
    @Body() body: CreateReviewDto,
    @UploadedFile() file?: Express.Multer.File,
    @Req() req?: any,
  ) {
    // 1) find business by slug (tenant resolver)
    const biz = await this.reviewsService.findBusinessBySlug(slug);
    if (!biz) {
      throw new BadRequestException('Business not found');
    }

    // 1.5) Check storage limits for file uploads
    if (file && (body.type === 'video' || body.type === 'audio')) {
      const isStorageExceeded = await this.billingService.isStorageExceeded(biz.id);
      if (isStorageExceeded) {
        throw new ForbiddenException('Storage limit exceeded. Please upgrade your plan to continue accepting reviews.');
      }
    }

    // 2) Milestone 5: Check if text reviews are enabled
    if (body.type === 'text') {
      const textEnabled = biz.settingsJson?.textReviewsEnabled ?? true; // default enabled
      if (!textEnabled) {
        throw new BadRequestException('Text reviews are not enabled for this business');
      }
    }

    // 3) Validate type vs file presence
    if ((body.type === 'video' || body.type === 'audio') && !file) {
      throw new BadRequestException('File is required for video/audio reviews');
    }
    if (body.type === 'text' && file) {
      throw new BadRequestException('Do not upload files for text reviews');
    }

    // 4) create review row with consent logging
    const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
    const userAgent = req?.get('User-Agent') || 'unknown';
    const review = await this.reviewsService.createReviewForBusiness(biz, body, ip, userAgent);

    // 5) if file present -> upload & attach
    let mediaAsset: MediaAsset | null = null;
    if (file) {
      // file.buffer is available because multer memory storage is used
      const stream = Readable.from(file.buffer);
      mediaAsset = await this.reviewsService.uploadFileAndAttach(
        biz,
        review,
        stream,
        {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
      );
    }

    return {
      message: 'Review submitted',
      review: {
        id: review.id,
        businessId: review.businessId,
        type: review.type,
        status: review.status,
      },
      mediaAsset: mediaAsset
        ? { id: mediaAsset.id, s3Key: mediaAsset.s3Key }
        : null,
    };
  }
}
