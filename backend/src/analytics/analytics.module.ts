import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { Review } from '../review/entities/review.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { BusinessModule } from '../business/business.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      Review,
      Widget,
    ]),
    StorageModule,
    AuthModule,
    BusinessModule,
    forwardRef(() => BillingModule),
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
