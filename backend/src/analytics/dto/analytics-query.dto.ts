import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { AnalyticsEventType } from '../entities/analytics-event.entity';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(AnalyticsEventType)
  eventType?: AnalyticsEventType;

  @IsOptional()
  @IsString()
  widgetId?: string;
}