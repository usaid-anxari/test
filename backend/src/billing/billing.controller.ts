import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { BusinessService } from '../business/business.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('Billing')
@Controller('api/billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly businessService: BusinessService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('status')
  @ApiResponse({ status: 200, description: 'Get subscription status' })
  async getSubscriptionStatus(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('No business found for user');
    }

    const billingInfo = await this.billingService.getBillingInfo(business.id);
    
    return {
      status: billingInfo.billingStatus,
      tier: billingInfo.pricingTier,
      storageUsage: `${billingInfo.storageUsageGb}/${billingInfo.storageLimitGb}`,
      trialActive: billingInfo.isTrialActive,
      trialDaysLeft: billingInfo.daysUntilTrialEnd,
      storagePercentage: billingInfo.storageUsagePercentage,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('info')
  @ApiResponse({ status: 200, description: 'Get detailed billing information' })
  async getBillingInfo(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('No business found for user');
    }

    return this.billingService.getBillingInfo(business.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('plans')
  @ApiResponse({ status: 200, description: 'Get available pricing plans' })
  async getPricingPlans() {
    return this.billingService.getPricingPlans();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('checkout')
  @ApiBody({ type: CreateCheckoutSessionDto })
  @ApiResponse({ status: 201, description: 'Create checkout session' })
  async createCheckoutSession(@Req() req, @Body() createCheckoutSessionDto: CreateCheckoutSessionDto) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('No business found for user');
    }

    return this.billingService.createCheckoutSession(business.id, createCheckoutSessionDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('portal')
  @ApiResponse({ status: 201, description: 'Create customer portal session' })
  async createPortalSession(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('No business found for user');
    }

    return this.billingService.createCustomerPortalSession(business.id);
  }
}