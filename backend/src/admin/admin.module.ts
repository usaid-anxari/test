import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsModule } from 'src/review/review.module';
import { BusinessModule } from 'src/business/business.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Review } from 'src/review/entities/review.entity';
import { MediaAsset } from 'src/review/entities/media-asset.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, MediaAsset]),
    forwardRef(() => ReviewsModule),
    forwardRef(() => BusinessModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
