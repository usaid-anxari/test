import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { BillingInfoDto, PricingPlanDto } from './dto/billing-info.dto';

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('pricing-plans')
  async getPricingPlans(): Promise<PricingPlanDto[]> {
    return this.billingService.getPricingPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  async getBillingAccount(@Request() req): Promise<BillingInfoDto> {
    return this.billingService.getBillingInfo(req.user.businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckoutSession(
    @Request() req,
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ) {
    return this.billingService.createCheckoutSession(req.user.businessId, createCheckoutSessionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  async createCustomerPortalSession(@Request() req) {
    return this.billingService.createCustomerPortalSession(req.user.businessId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('storage/status')
  async getStorageStatus(@Request() req) {
    const billingInfo = await this.billingService.getBillingInfo(req.user.businessId);
    const isExceeded = await this.billingService.isStorageExceeded(req.user.businessId);
    
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
    const hasAccess = await this.billingService.canAccessFeature(req.user.businessId, feature);
    return { hasAccess, feature };
  }
}
