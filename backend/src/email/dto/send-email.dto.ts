import { IsEmail, IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { EmailType } from '../entities/email-log.entity';

export class SendEmailDto {
  @IsEmail()
  recipientEmail: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsEnum(EmailType)
  emailType: EmailType;

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsObject()
  templateData?: Record<string, any>;
}

export class UpdateEmailPreferencesDto {
  @IsOptional()
  reviewNotifications?: boolean;

  @IsOptional()
  billingNotifications?: boolean;

  @IsOptional()
  marketingEmails?: boolean;

  @IsOptional()
  featureUpdates?: boolean;
}