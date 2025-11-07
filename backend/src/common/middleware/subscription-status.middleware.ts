import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BillingService } from '../../billing/billing.service';
import { BusinessService } from '../../business/business.service';

@Injectable()
export class SubscriptionStatusMiddleware implements NestMiddleware {
  constructor(
    private billingService: BillingService,
    private businessService: BusinessService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only add subscription status for authenticated API requests
    if (req.path.startsWith('/api/') && req['userEntity']) {
      try {
        const business = await this.businessService.findDefaultForUser(req['userEntity'].id);
        if (business) {
          const billingInfo = await this.billingService.getBillingInfo(business.id);
          
          // Add subscription status to response headers
          res.setHeader('X-Subscription-Status', billingInfo.billingStatus);
          res.setHeader('X-Subscription-Tier', billingInfo.pricingTier);
          res.setHeader('X-Storage-Usage', `${billingInfo.storageUsageGb}/${billingInfo.storageLimitGb}`);
          res.setHeader('X-Trial-Active', billingInfo.isTrialActive.toString());
          
          if (billingInfo.isTrialActive) {
            res.setHeader('X-Trial-Days-Left', billingInfo.daysUntilTrialEnd.toString());
          }
        }
      } catch (error) {
        // Don't fail the request if subscription status check fails
        console.warn('Failed to get subscription status:', error.message);
      }
    }
    
    next();
  }
}