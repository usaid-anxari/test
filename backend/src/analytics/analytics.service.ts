import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { AnalyticsEvent, AnalyticsEventType } from './entities/analytics-event.entity';
import { TrackEventDto } from './dto/track-event.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { DashboardStatsDto, WidgetPerformanceDto, ReviewTrendDto, TopWidgetDto } from './dto/dashboard-stats.dto';
import { Review } from '../review/entities/review.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { StorageService } from '../storage/storage.service';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private analyticsEventRepository: Repository<AnalyticsEvent>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Widget)
    private widgetRepository: Repository<Widget>,
    private storageService: StorageService,
    private billingService: BillingService,
  ) {}

  async trackEvent(
    businessId: string,
    trackEventDto: TrackEventDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<AnalyticsEvent> {
    const { businessId: dtoBusinessId, ...eventData } = trackEventDto;
    const event = this.analyticsEventRepository.create({
      businessId,
      ...eventData,
      userAgent,
      ipAddress,
    });

    return this.analyticsEventRepository.save(event);
  }

  async getDashboardStats(
    businessId: string,
    query: AnalyticsQueryDto,
  ): Promise<DashboardStatsDto> {
    const { startDate, endDate } = this.getDateRange(query);

    const [totalReviews, totalViews, totalClicks, totalSubmissions, storageInfo] = await Promise.all([
      this.getTotalReviews(businessId, startDate, endDate),
      this.getTotalEvents(businessId, AnalyticsEventType.VIEW, startDate, endDate),
      this.getTotalEvents(businessId, AnalyticsEventType.CLICK, startDate, endDate),
      this.getTotalReviews(businessId, startDate, endDate), // Use review count as submissions
      this.storageService.getUsageForBusiness(businessId),
    ]);

    const [widgetPerformance, reviewTrends, topPerformingWidgets] = await Promise.all([
      this.getWidgetPerformance(businessId, startDate, endDate),
      this.getReviewTrends(businessId, startDate, endDate),
      this.getTopPerformingWidgets(businessId, startDate, endDate),
    ]);

    console.log('Storage info from service:', storageInfo);
    
    // Get actual billing info for storage limit
    let actualStorageLimit = storageInfo?.bytesLimit || (1 * 1024 * 1024 * 1024); // Default 1GB
    let billingTier = 'FREE';
    
    try {
      const billingInfo = await this.billingService.getBillingInfo(businessId);
      console.log('Billing info:', billingInfo);
      
      const storageLimits = {
        'free': 1 * 1024 * 1024 * 1024,
        'starter': 10 * 1024 * 1024 * 1024,
        'professional': 50 * 1024 * 1024 * 1024,
        'enterprise': 200 * 1024 * 1024 * 1024
      };
      
      billingTier = billingInfo?.pricingTier || 'free';
      actualStorageLimit = storageLimits[billingTier.toLowerCase()] || storageLimits['free'];
      console.log('Billing tier:', billingTier, 'Storage limit:', actualStorageLimit);
    } catch (error) {
      console.log('Error getting billing info:', error.message);
    }

    const bytesUsed = storageInfo?.bytesUsed || 0;
    const storageUsedGB = bytesUsed / (1024 * 1024 * 1024);
    const storageLimitGB = actualStorageLimit / (1024 * 1024 * 1024);
    
    console.log('Bytes used:', bytesUsed, 'GB used:', storageUsedGB, 'GB limit:', storageLimitGB);

    return {
      totalReviews,
      totalViews,
      totalClicks,
      totalSubmissions,
      storageUsed: Math.round(storageUsedGB * 1000) / 1000, // Keep 3 decimal places
      storageLimit: Math.round(storageLimitGB * 100) / 100, // Keep 2 decimal places
      widgetPerformance,
      reviewTrends,
      topPerformingWidgets,
    };
  }

  async getWidgetAnalytics(
    businessId: string,
    widgetId: string,
    query: AnalyticsQueryDto,
  ): Promise<WidgetPerformanceDto> {
    const { startDate, endDate } = this.getDateRange(query);

    const widget = await this.widgetRepository.findOne({
      where: { id: widgetId, businessId },
    });

    if (!widget) {
      throw new Error('Widget not found');
    }

    const [views, clicks, conversions] = await Promise.all([
      this.getWidgetEvents(businessId, widgetId, AnalyticsEventType.WIDGET_VIEW, startDate, endDate),
      this.getWidgetEvents(businessId, widgetId, AnalyticsEventType.WIDGET_CLICK, startDate, endDate),
      this.getWidgetEvents(businessId, widgetId, AnalyticsEventType.REVIEW_SUBMISSION, startDate, endDate),
    ]);

    const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

    return {
      widgetId,
      widgetName: widget.name,
      views,
      clicks,
      conversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  async getReviewTrends(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ReviewTrendDto[]> {
    const trends = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select('DATE(event.created_at)', 'date')
      .addSelect('COUNT(CASE WHEN event.event_type = :submission THEN 1 END)', 'submissions')
      .addSelect('COUNT(CASE WHEN event.event_type = :view THEN 1 END)', 'views')
      .where('event.business_id = :businessId', { businessId })
      .andWhere('event.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .setParameters({ submission: AnalyticsEventType.SUBMISSION, view: AnalyticsEventType.VIEW })
      .groupBy('DATE(event.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const reviewCounts = await this.reviewRepository
      .createQueryBuilder('review')
      .select('DATE(review.created_at)', 'date')
      .addSelect('COUNT(*)', 'reviews')
      .where('review.business_id = :businessId', { businessId })
      .andWhere('review.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('DATE(review.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const trendsMap = new Map();
    trends.forEach(trend => {
      trendsMap.set(trend.date, {
        date: trend.date,
        reviews: 0,
        views: parseInt(trend.views) || 0,
        submissions: parseInt(trend.submissions) || 0,
      });
    });

    reviewCounts.forEach(review => {
      const existing = trendsMap.get(review.date) || {
        date: review.date,
        reviews: 0,
        views: 0,
        submissions: 0,
      };
      existing.reviews = parseInt(review.reviews) || 0;
      trendsMap.set(review.date, existing);
    });

    return Array.from(trendsMap.values()).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).toISOString() : '';
      const dateB = b.date ? new Date(b.date).toISOString() : '';
      return dateA.localeCompare(dateB);
    });
  }

  private async getTotalReviews(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    return this.reviewRepository.count({
      where: {
        businessId,
        createdAt: Between(startDate, endDate),
      },
    });
  }

  private async getTotalEvents(
    businessId: string,
    eventType: AnalyticsEventType,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Map the event types to what widgets actually send
    let actualEventType = eventType;
    if (eventType === AnalyticsEventType.VIEW) {
      actualEventType = AnalyticsEventType.WIDGET_VIEW;
    } else if (eventType === AnalyticsEventType.CLICK) {
      actualEventType = AnalyticsEventType.WIDGET_CLICK;
    } else if (eventType === AnalyticsEventType.SUBMISSION) {
      actualEventType = AnalyticsEventType.REVIEW_SUBMISSION;
    }
    
    // Only count widget-specific events (with widgetId)
    return this.analyticsEventRepository.count({
      where: {
        businessId,
        eventType: actualEventType,
        widgetId: Not(IsNull()),
        createdAt: Between(startDate, endDate),
      },
    });
  }

  private async getWidgetEvents(
    businessId: string,
    widgetId: string,
    eventType: AnalyticsEventType,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.analyticsEventRepository.count({
      where: {
        businessId,
        widgetId,
        eventType,
        createdAt: Between(startDate, endDate),
      },
    });
  }



  private async getWidgetPerformance(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<WidgetPerformanceDto[]> {
    const widgets = await this.widgetRepository.find({
      where: { businessId },
    });

    const performance = await Promise.all(
      widgets.map(async (widget) => {
        const [views, clicks, conversions] = await Promise.all([
          this.getWidgetEvents(businessId, widget.id, AnalyticsEventType.WIDGET_VIEW, startDate, endDate),
          this.getWidgetEvents(businessId, widget.id, AnalyticsEventType.WIDGET_CLICK, startDate, endDate),
          this.getWidgetEvents(businessId, widget.id, AnalyticsEventType.REVIEW_SUBMISSION, startDate, endDate),
        ]);

        const conversionRate = views > 0 ? (conversions / views) * 100 : 0;

        return {
          widgetId: widget.id,
          widgetName: widget.name,
          views,
          clicks,
          conversions,
          conversionRate: Math.round(conversionRate * 100) / 100,
        };
      }),
    );

    return performance.sort((a, b) => b.views - a.views);
  }

  private async getTopPerformingWidgets(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TopWidgetDto[]> {
    const result = await this.analyticsEventRepository
      .createQueryBuilder('event')
      .select('event.widget_id', 'widgetId')
      .addSelect('COUNT(CASE WHEN event.event_type = :view THEN 1 END)', 'totalViews')
      .addSelect('COUNT(CASE WHEN event.event_type = :click THEN 1 END)', 'totalClicks')
      .leftJoin('event.widget', 'widget')
      .addSelect('widget.name', 'widgetName')
      .where('event.business_id = :businessId', { businessId })
      .andWhere('event.widget_id IS NOT NULL')
      .andWhere('event.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .setParameters({ view: AnalyticsEventType.WIDGET_VIEW, click: AnalyticsEventType.WIDGET_CLICK })
      .groupBy('event.widget_id, widget.name')
      .orderBy('"totalViews"', 'DESC')
      .limit(5)
      .getRawMany();

    return result.map(row => ({
      widgetId: row.widgetId,
      widgetName: row.widgetName || 'Unknown Widget',
      totalViews: parseInt(row.totalViews) || 0,
      totalClicks: parseInt(row.totalClicks) || 0,
    }));
  }

  private getDateRange(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    return { startDate, endDate };
  }
}
