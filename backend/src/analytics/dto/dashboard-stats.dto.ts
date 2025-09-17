export class DashboardStatsDto {
  totalReviews: number;
  totalViews: number;
  totalClicks: number;
  totalSubmissions: number;
  storageUsed: number;
  storageLimit: number;
  widgetPerformance: WidgetPerformanceDto[];
  reviewTrends: ReviewTrendDto[];
  topPerformingWidgets: TopWidgetDto[];
}

export class WidgetPerformanceDto {
  widgetId: string;
  widgetName: string;
  views: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
}

export class ReviewTrendDto {
  date: string;
  reviews: number;
  views: number;
  submissions: number;
}

export class TopWidgetDto {
  widgetId: string;
  widgetName: string;
  totalViews: number;
  totalClicks: number;
}