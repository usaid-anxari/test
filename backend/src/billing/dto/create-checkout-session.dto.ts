import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingTier } from '../entities/billing-account.entity';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'The pricing tier to subscribe to',
    enum: PricingTier,
    example: PricingTier.STARTER,
  })
  @IsEnum(PricingTier)
  pricingTier: PricingTier;

  @ApiPropertyOptional({
    description: 'URL to redirect to after successful payment',
    example: 'https://yourdomain.com/billing/success',
  })
  @IsOptional()
  @IsUrl()
  successUrl?: string;

  @ApiPropertyOptional({
    description: 'URL to redirect to after cancelled payment',
    example: 'https://yourdomain.com/billing/cancel',
  })
  @IsOptional()
  @IsUrl()
  cancelUrl?: string;
}