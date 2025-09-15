import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './review.service';
import { ReviewsController } from './review.controller';
import { Review } from './entities/review.entity';
import { MediaAsset } from './entities/media-asset.entity';
import { TranscodeJob } from './entities/transcode-job.entity';
import { Business } from '../business/entities/business.entity';
import { S3Service } from '../common/s3/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Review, MediaAsset, TranscodeJob, Business]), ConfigModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, S3Service],
  exports: [ReviewsService],
})
export class ReviewsModule {}
