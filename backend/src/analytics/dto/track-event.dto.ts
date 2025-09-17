import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { AnalyticsEventType } from '../entities/analytics-event.entity';

export class TrackEventDto {
  @IsString()
  businessId: string;

  @IsEnum(AnalyticsEventType)
  eventType: AnalyticsEventType;

  @IsOptional()
  @IsString()
  widgetId?: string;

  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;

  @IsOptional()
  @IsString()
  referrerUrl?: string;
}