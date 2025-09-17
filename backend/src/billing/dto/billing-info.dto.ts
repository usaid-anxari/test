import { BillingStatus, PricingTier } from '../entities/billing-account.entity';

export class BillingInfoDto {
  id: string;
  businessId: string;
  billingStatus: BillingStatus;
  pricingTier: PricingTier;
  storageLimitGb: number;
  monthlyPriceCents: number;
  trialEndsAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  storageUsageGb: number;
  storageUsagePercentage: number;
  isTrialActive: boolean;
  daysUntilTrialEnd: number;
}

export class PricingPlanDto {
  tier: PricingTier;
  name: string;
  description: string;
  monthlyPriceCents: number;
  storageLimitGb: number;
  features: string[];
  stripePriceId: string | null;
  isPopular: boolean;
}