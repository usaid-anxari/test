import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PricingTier } from '../entities/billing-account.entity';

export class CreateCheckoutSessionDto {
  @IsEnum(PricingTier)
  pricingTier: PricingTier;

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}