import { 
  CanActivate, 
  ExecutionContext, 
  Injectable, 
  ForbiddenException,
  Logger 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BillingService } from '../../billing/billing.service';
import { BusinessService } from '../../business/business.service';
import { BillingStatus, PricingTier } from '../../billing/entities/billing-account.entity';

export interface SubscriptionRequirement {
  minTier?: PricingTier;
  features?: string[];
  allowTrial?: boolean;
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);
  private billingCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 60000; // 1 minute cache

  constructor(
    private reflector: Reflector,
    private billingService: BillingService,
    private businessService: BusinessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.get<SubscriptionRequirement>(
      'subscription',
      context.getHandler(),
    );

    if (!requirement) {
      return true; // No subscription requirement
    }

    const req = context.switchToHttp().getRequest();
    const userEntity = req.userEntity;

    if (!userEntity) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's default business
    const business = await this.businessService.findDefaultForUser(userEntity.id);
    if (!business) {
      throw new ForbiddenException('No business associated with user');
    }

    // Get billing info with caching
    const cacheKey = `billing:${business.id}`;
    const cached = this.billingCache.get(cacheKey);
    
    let billingInfo;
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      billingInfo = cached.data;
    } else {
      billingInfo = await this.billingService.getBillingInfo(business.id);
      this.billingCache.set(cacheKey, { data: billingInfo, timestamp: Date.now() });
      
      // Clean cache periodically
      if (this.billingCache.size > 100) {
        this.cleanCache();
      }
    }

    // Check if subscription is active or in trial (if trial allowed)
    const isActive = billingInfo.billingStatus === BillingStatus.ACTIVE;
    const isTrialing = billingInfo.billingStatus === BillingStatus.TRIALING && billingInfo.isTrialActive;
    
    if (!isActive && !(requirement.allowTrial && isTrialing)) {
      throw new ForbiddenException('Active subscription required');
    }

    // Check minimum tier requirement
    if (requirement.minTier) {
      const tierOrder = {
        [PricingTier.FREE]: 0,
        [PricingTier.STARTER]: 1,
        [PricingTier.PROFESSIONAL]: 2,
        [PricingTier.ENTERPRISE]: 3,
      };

      const currentTierLevel = tierOrder[billingInfo.pricingTier];
      const requiredTierLevel = tierOrder[requirement.minTier];

      if (currentTierLevel < requiredTierLevel) {
        throw new ForbiddenException(`${requirement.minTier} plan or higher required`);
      }
    }

    // Check feature access
    if (requirement.features) {
      for (const feature of requirement.features) {
        const hasAccess = await this.billingService.canAccessFeature(business.id, feature);
        if (!hasAccess) {
          throw new ForbiddenException(`Feature '${feature}' not available in current plan`);
        }
      }
    }

    // Add billing info to request for controllers to use
    req.billingInfo = billingInfo;
    req.businessId = business.id;

    return true;
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, data] of this.billingCache.entries()) {
      if (now - data.timestamp > this.CACHE_TTL) {
        this.billingCache.delete(key);
      }
    }
  }
}