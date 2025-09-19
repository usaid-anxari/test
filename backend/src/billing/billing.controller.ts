import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import { BusinessService } from '../business/business.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { BillingInfoDto, PricingPlanDto } from './dto/billing-info.dto';

@Controller('api/billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly businessService: BusinessService,
  ) {}

  @Get('pricing-plans')
  async getPricingPlans(): Promise<PricingPlanDto[]> {
    return this.billingService.getPricingPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  async getBillingAccount(@Request() req): Promise<BillingInfoDto> {
    const userId = req.userEntity?.id;
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    const business = await this.businessService.findDefaultForUser(userId);
    if (!business) {
      throw new Error('No business found for user');
    }
    
    return this.billingService.getBillingInfo(business.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckoutSession(
    @Request() req,
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ) {
    const userId = req.userEntity?.id;
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    const business = await this.businessService.findDefaultForUser(userId);
    if (!business) {
      throw new Error('No business found for user');
    }
    
    return this.billingService.createCheckoutSession(business.id, createCheckoutSessionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  async createCustomerPortalSession(@Request() req) {
    const userId = req.userEntity?.id;
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    const business = await this.businessService.findDefaultForUser(userId);
    if (!business) {
      throw new Error('No business found for user');
    }
    
    return this.billingService.createCustomerPortalSession(business.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('storage/status')
  async getStorageStatus(@Request() req) {
    const userId = req.userEntity?.id;
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    const business = await this.businessService.findDefaultForUser(userId);
    if (!business) {
      throw new Error('No business found for user');
    }
    
    const billingInfo = await this.billingService.getBillingInfo(business.id);
    const isExceeded = await this.billingService.isStorageExceeded(business.id);
    
    return {
      storageUsageGb: billingInfo.storageUsageGb,
      storageLimitGb: billingInfo.storageLimitGb,
      usagePercentage: billingInfo.storageUsagePercentage,
      isExceeded,
      canUpload: !isExceeded,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('features/:feature/access')
  async checkFeatureAccess(
    @Request() req,
    @Param('feature') feature: string,
  ) {
    const userId = req.userEntity?.id;
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    const business = await this.businessService.findDefaultForUser(userId);
    if (!business) {
      throw new Error('No business found for user');
    }
    
    const hasAccess = await this.billingService.canAccessFeature(business.id, feature);
    return { hasAccess, feature };
  }
}
