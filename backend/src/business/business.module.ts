import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessUser } from './entities/business-user.entity';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { Review } from '../review/entities/review.entity';
import { MediaAsset } from '../review/entities/media-asset.entity';
import { GoogleReview } from '../google/entities/google-review.entity';
import { S3Service } from '../common/s3/s3.service';
import { ConfigModule } from '@nestjs/config';
import { BillingModule } from '../billing/billing.module';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessUser, User, Review, MediaAsset, GoogleReview]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    ConfigModule,
    BillingModule,
  ],
  providers: [BusinessService, S3Service, SubscriptionGuard],
  controllers: [BusinessController],
  exports: [BusinessService],
})
export class BusinessModule {}