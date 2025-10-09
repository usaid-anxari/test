import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { BusinessService } from '../business/business.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@ApiTags('Billing')
@Controller('api/billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
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
  async createCheckoutSession(@Req() req, @Body() body: any) {
    try {
      const userId = req.userEntity.id;
      console.log('Creating checkout session for user:', userId);
      console.log('Raw body received:', JSON.stringify(body, null, 2));
      console.log('Body keys:', Object.keys(body));
      console.log('PricingTier value:', body.pricingTier);
      console.log('PricingTier type:', typeof body.pricingTier);
      console.log('Request headers:', req.headers['content-type']);
      
      const business = await this.businessService.findDefaultForUser(userId);
      
      if (!business) {
        console.error('No business found for user:', userId);
        throw new BadRequestException('No business found for user. Please create a business first.');
      }

      console.log('Found business:', business.id);
      
      // Validate required field
      if (!body.pricingTier) {
        throw new BadRequestException('pricingTier is required');
      }
      
      // Manual DTO construction to bypass validation issues
      const createCheckoutSessionDto: CreateCheckoutSessionDto = {
        pricingTier: body.pricingTier,
        successUrl: body.successUrl,
        cancelUrl: body.cancelUrl
      };
      
      console.log('Constructed DTO:', createCheckoutSessionDto);
      
      return this.billingService.createCheckoutSession(business.id, createCheckoutSessionDto);
    } catch (error) {
      console.error('Checkout session error:', error);
      throw error;
    }
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

  @Post('webhook')
  @ApiResponse({ status: 200, description: 'Handle Stripe webhook' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    const event = await this.billingService.verifyWebhook(
      req.rawBody,
      signature,
      webhookSecret,
    );

    await this.billingService.handleWebhookEvent(event);
    
    return { received: true };
  }
}