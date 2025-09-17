import { Controller, Get, Post, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { DashboardStatsDto, WidgetPerformanceDto } from './dto/dashboard-stats.dto';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboardStats(
    @Request() req,
    @Query() query: AnalyticsQueryDto,
  ): Promise<DashboardStatsDto> {
    return this.analyticsService.getDashboardStats(req.user.businessId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('widgets/:widgetId/performance')
  async getWidgetAnalytics(
    @Request() req,
    @Param('widgetId') widgetId: string,
    @Query() query: AnalyticsQueryDto,
  ): Promise<WidgetPerformanceDto> {
    return this.analyticsService.getWidgetAnalytics(req.user.businessId, widgetId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reviews/trends')
  async getReviewTrends(
    @Request() req,
    @Query() query: AnalyticsQueryDto,
  ) {
    const { startDate, endDate } = this.getDateRange(query);
    return this.analyticsService.getReviewTrends(req.user.businessId, startDate, endDate);
  }

  @UseGuards(JwtAuthGuard)
  @Get('storage/usage')
  async getStorageUsage(@Request() req) {
    const stats = await this.analyticsService.getDashboardStats(req.user.businessId, {});
    return {
      storageUsed: stats.storageUsed,
      storageLimit: stats.storageLimit,
      usagePercentage: stats.storageLimit > 0 ? (stats.storageUsed / stats.storageLimit) * 100 : 0,
    };
  }

  @Post('events')
  async trackEvent(
    @Body() trackEventDto: TrackEventDto,
    @Request() req,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    return this.analyticsService.trackEvent(
      trackEventDto.businessId,
      trackEventDto,
      userAgent,
      ipAddress,
    );
  }

  private getDateRange(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }
}
