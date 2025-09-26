import { Controller, Get, Post, Body, UseGuards, Request, Param, Headers,  Req  } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { BillingService } from './billing.service';
import { BusinessService } from '../business/business.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { BillingInfoDto, PricingPlanDto } from './dto/billing-info.dto';
import { BillingStatus, PricingTier } from './entities/billing-account.entity';
import type { RawBodyRequest} from "@nestjs/common";
@ApiTags('Billing')
@Controller('api/billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly businessService: BusinessService,
  ) {}

  @Get('pricing-plans')
  @ApiOperation({ summary: 'Get all pricing plans' })
  @ApiResponse({ status: 200, description: 'Returns all available pricing plans', type: [PricingPlanDto] })
  async getPricingPlans(): Promise<PricingPlanDto[]> {
    return this.billingService.getPricingPlans();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('account')
  @ApiOperation({ summary: 'Get billing account information' })
  @ApiResponse({ status: 200, description: 'Returns billing account details', type: BillingInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh billing account information' })
  @ApiResponse({ status: 200, description: 'Returns refreshed billing account details', type: BillingInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshBillingAccount(@Request() req): Promise<BillingInfoDto> {
    const userId = req.userEntity?.id;
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    const business = await this.businessService.findDefaultForUser(userId);
    if (!business) {
      throw new Error('No business found for user');
    }
    
    // Force refresh by getting latest data
    return this.billingService.getBillingInfo(business.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('checkout')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 201, description: 'Returns checkout URL and session ID' })
  @ApiResponse({ status: 400, description: 'Invalid pricing tier' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth()
  @Post('portal')
  @ApiOperation({ summary: 'Create Stripe customer portal session' })
  @ApiResponse({ status: 201, description: 'Returns customer portal URL' })
  @ApiResponse({ status: 400, description: 'No Stripe customer found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth()
  @Get('storage/status')
  @ApiOperation({ summary: 'Get storage usage status' })
  @ApiResponse({ status: 200, description: 'Returns storage usage information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth()
  @Get('features/:feature/access')
  @ApiOperation({ summary: 'Check access to a specific feature' })
  @ApiParam({ name: 'feature', description: 'Feature name to check access for' })
  @ApiResponse({ status: 200, description: 'Returns feature access status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      // For development mode, simulate webhook processing
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        // In development, simulate successful subscription creation
        const body = req.body;
        if (body && typeof body === 'object' && 'businessId' in body && 'pricingTier' in body) {
          await this.billingService.updateSubscription(
            body.businessId as string,
            'sub_dev_mode',
            body.pricingTier as PricingTier,
            BillingStatus.ACTIVE,
          );
          return { received: true, processed: true, mode: 'development' };
        }
        return { received: true, processed: false, mode: 'development' };
      }

      // Production webhook handling would go here
      // const event = this.stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      // Handle different event types...
      
      return { received: true };
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  }

  @Post('dev/simulate-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Simulate successful payment (development only)' })
  @ApiResponse({ status: 200, description: 'Payment simulation completed' })
  async simulatePayment(
    @Request() req,
    @Body() body: { pricingTier: PricingTier },
  ) {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('This endpoint is only available in development mode');
    }

    const userId = req.userEntity?.id;
    if (!userId) {
      throw new Error('No user ID found');
    }
    
    const business = await this.businessService.findDefaultForUser(userId);
    if (!business) {
      throw new Error('No business found for user');
    }

    // Simulate successful subscription
    await this.billingService.updateSubscription(
      business.id,
      'sub_dev_mode_' + Date.now(),
      body.pricingTier,
      BillingStatus.ACTIVE,
    );

    return { success: true, message: 'Payment simulated successfully' };
  }
}
