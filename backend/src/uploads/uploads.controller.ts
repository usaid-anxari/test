import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  Get,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { InitMultipartDto } from './dto/init-multipart.dto';
import { CompleteMultipartDto } from './dto/complete-multipart.dto';
import { ApiTags } from '@nestjs/swagger';
import { BusinessService } from 'src/business/business.service';
import { ReviewsService } from 'src/review/review.service';
import { TranscodeService } from 'src/transcode/transcode.service';

@ApiTags('uploads')
@Controller('api/uploads')
export class UploadsController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly businessService: BusinessService,
    private readonly reviewsService: ReviewsService,
    private readonly transcodeService: TranscodeService,
  ) {}

  // Init multipart -> returns uploadId + s3Key
  @Post('multipart/init/:slug')
  @UsePipes(new ValidationPipe({ transform: true }))
  async init(@Param('slug') slug: string, @Body() dto: InitMultipartDto) {
    const biz = await this.businessService.findBySlug(slug);
    if (!biz) throw new BadRequestException('Invalid business slug');

    const { s3Key, uploadId } = await this.uploadService.initMultipartUpload(
      biz.id,
      dto.filename,
      dto.contentType,
    );
    return { s3Key, uploadId };
  }

  // Presign a single part
  @Get('multipart/presign')
  async presignPart(
    @Query('s3Key') s3Key: string,
    @Query('uploadId') uploadId: string,
    @Query('partNumber') partNumber: string,
  ) {
    if (!s3Key || !uploadId || !partNumber)
      throw new BadRequestException('missing params');
    const url = await this.uploadService.presignUploadPart(
      s3Key,
      uploadId,
      Number(partNumber),
    );
    return { url };
  }

  // Complete multipart upload: client sends parts with ETags; server completes and then optionally create MediaAsset & enqueue transcode job
  // Complete multipart upload: client sends parts with ETags; server completes and then optionally create MediaAsset & enqueue transcode job
  @Post('multipart/complete/:slug')
  @UsePipes(new ValidationPipe({ transform: true }))
  async complete(
    @Param('slug') slug: string,
    @Body() dto: CompleteMultipartDto,
    @Query('reviewId') reviewId: string,
  ) {
    const biz = await this.businessService.findBySlug(slug);
    if (!biz) throw new BadRequestException('Invalid business slug');

    // complete on S3
    const res = await this.uploadService.completeMultipartUpload(
      dto.s3Key,
      dto.uploadId,
      dto.parts,
    );

    // find the review entity
    const review = await this.reviewsService.findOneById(reviewId);
    if (!review) throw new BadRequestException('Invalid reviewId');

    // create media asset record directly (no fileStream/file needed)
    const created = await this.reviewsService.createMediaAssetAndAttach(
      biz,
      review,
      {
        s3Key: dto.s3Key,
        assetType: 'original',
        metadataJson: { s3CompleteResult: res },
      },
    );

    // Optionally enqueue transcode job(s) for video (format, 720p)
    if (
      created &&
      (dto.s3Key.endsWith('.mp4') ||
        dto.s3Key.endsWith('.mov') ||
        dto.s3Key.endsWith('.webm'))
    ) {
      await this.transcodeService.createTranscodeJob(
        biz.id,
        reviewId,
        created.id,
        '720p_h264_1Mbps',
      );
    }

    return {
      completed: true,
      assetId: created?.id ?? null,
      s3Location: res.Location ?? null,
    };
  }
}
