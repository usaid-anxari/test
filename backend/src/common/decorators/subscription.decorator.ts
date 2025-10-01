import { SetMetadata } from '@nestjs/common';
import { PricingTier } from '../../billing/entities/billing-account.entity';

export interface SubscriptionRequirement {
  minTier?: PricingTier;
  features?: string[];
  allowTrial?: boolean;
}

export const RequireSubscription = (requirement: SubscriptionRequirement) =>
  SetMetadata('subscription', requirement);

// Convenience decorators for common requirements
export const RequireStarterPlan = () => 
  RequireSubscription({ minTier: PricingTier.STARTER, allowTrial: true });

export const RequireProfessionalPlan = () => 
  RequireSubscription({ minTier: PricingTier.PROFESSIONAL, allowTrial: false });

export const RequireEnterprisePlan = () => 
  RequireSubscription({ minTier: PricingTier.ENTERPRISE, allowTrial: false });

export const RequireActiveSubscription = () => 
  RequireSubscription({ allowTrial: false });

export const RequireFeature = (features: string[]) => 
  RequireSubscription({ features, allowTrial: true });