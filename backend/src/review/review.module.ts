import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './review.service';
import { ReviewsController } from './review.controller';
import { Review } from './entities/review.entity';
import { MediaAsset } from './entities/media-asset.entity';
import { TranscodeJob } from './entities/transcode-job.entity';
import { ConsentLog } from './entities/consent-log.entity';
import { Business } from '../business/entities/business.entity';
import { S3Service } from '../common/s3/s3.service';
import { ConfigModule } from '@nestjs/config';
import { PublicReviewsController } from './public.controller';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, MediaAsset, TranscodeJob, ConsentLog, Business]),
    ConfigModule,
    BillingModule,
  ],
  controllers: [ReviewsController, PublicReviewsController],
  providers: [ReviewsService, S3Service],
  exports: [ReviewsService],
})
export class ReviewsModule {}
