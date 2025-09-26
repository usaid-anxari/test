import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingStatus, PricingTier } from '../entities/billing-account.entity';

export class BillingInfoDto {
  @ApiProperty({
    description: 'Billing account ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'Business ID associated with this billing account',
    example: 'uuid-string',
  })
  businessId: string;

  @ApiProperty({
    description: 'Current billing status',
    enum: BillingStatus,
    example: BillingStatus.ACTIVE,
  })
  billingStatus: BillingStatus;

  @ApiProperty({
    description: 'Current pricing tier',
    enum: PricingTier,
    example: PricingTier.STARTER,
  })
  pricingTier: PricingTier;

  @ApiProperty({
    description: 'Storage limit in GB',
    example: 10,
  })
  storageLimitGb: number;

  @ApiProperty({
    description: 'Monthly price in cents',
    example: 1900,
  })
  monthlyPriceCents: number;

  @ApiPropertyOptional({
    description: 'Trial end date',
    example: '2024-01-15T00:00:00Z',
  })
  trialEndsAt?: Date;

  @ApiPropertyOptional({
    description: 'Current billing period start',
    example: '2024-01-01T00:00:00Z',
  })
  currentPeriodStart?: Date;

  @ApiPropertyOptional({
    description: 'Current billing period end',
    example: '2024-01-31T00:00:00Z',
  })
  currentPeriodEnd?: Date;

  @ApiProperty({
    description: 'Current storage usage in GB',
    example: 2.5,
  })
  storageUsageGb: number;

  @ApiProperty({
    description: 'Storage usage as percentage of limit',
    example: 25.0,
  })
  storageUsagePercentage: number;

  @ApiProperty({
    description: 'Whether trial is currently active',
    example: false,
  })
  isTrialActive: boolean;

  @ApiProperty({
    description: 'Days remaining until trial ends',
    example: 0,
  })
  daysUntilTrialEnd: number;
}

export class PricingPlanDto {
  @ApiProperty({
    description: 'Pricing tier',
    enum: PricingTier,
    example: PricingTier.STARTER,
  })
  tier: PricingTier;

  @ApiProperty({
    description: 'Plan name',
    example: 'Starter',
  })
  name: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Great for small businesses',
  })
  description: string;

  @ApiProperty({
    description: 'Monthly price in cents',
    example: 1900,
  })
  monthlyPriceCents: number;

  @ApiProperty({
    description: 'Storage limit in GB',
    example: 10,
  })
  storageLimitGb: number;

  @ApiProperty({
    description: 'List of features included in this plan',
    example: ['10GB storage', 'All widget styles', 'Priority support'],
    type: [String],
  })
  features: string[];

  @ApiPropertyOptional({
    description: 'Stripe price ID for this plan',
    example: 'price_starter_monthly',
  })
  stripePriceId?: string;

  @ApiProperty({
    description: 'Whether this plan is marked as popular',
    example: true,
  })
  isPopular: boolean;
}