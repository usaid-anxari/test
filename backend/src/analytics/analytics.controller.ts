import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, NotFoundException, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { DashboardStatsDto, WidgetPerformanceDto } from './dto/dashboard-stats.dto';
import { BusinessService } from '../business/business.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly businessService: BusinessService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async getUser(@Req() req) {
    return req.userEntity;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('dashboard')
  async getDashboardStats(
    @Request() req,
    @Query() query: AnalyticsQueryDto,
  ): Promise<DashboardStatsDto> {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new NotFoundException('No business found for user');
    }
    
    return this.analyticsService.getDashboardStats(business.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('widgets/:widgetId/performance')
  async getWidgetAnalytics(
    @Request() req,
    @Param('widgetId') widgetId: string,
    @Query() query: AnalyticsQueryDto,
  ): Promise<WidgetPerformanceDto> {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new NotFoundException('No business found for user');
    }
    
    return this.analyticsService.getWidgetAnalytics(business.id, widgetId, query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('reviews/trends')
  async getReviewTrends(
    @Request() req,
    @Query() query: AnalyticsQueryDto,
  ) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new NotFoundException('No business found for user');
    }
    
    const { startDate, endDate } = this.getDateRange(query);
    return this.analyticsService.getReviewTrends(business.id, startDate, endDate);
  }

    @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('storage/usage')
  async getStorageUsage(@Request() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new NotFoundException('No business found for user');
    }
    
    const stats = await this.analyticsService.getDashboardStats(business.id, {});
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

  @Post('track')
  async trackWidgetEvent(
    @Body() trackEventDto: TrackEventDto,
    @Request() req,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Validate businessId is provided
    if (!trackEventDto.businessId) {
      console.warn('Analytics tracking skipped: missing businessId');
      return { success: false, message: 'Missing businessId' };
    }
    
    // Fire and forget - don't wait for the database save to complete
    // This makes widget tracking much faster
    setImmediate(() => {
      this.analyticsService.trackEvent(
        trackEventDto.businessId,
        trackEventDto,
        userAgent,
        ipAddress,
      ).catch(error => {
        // Log error but don't fail the request
        console.error('Analytics tracking error:', error);
      });
    });
    
    // Return immediately with success
    return { success: true, message: 'Event tracked' };
  }

  private getDateRange(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }
}
