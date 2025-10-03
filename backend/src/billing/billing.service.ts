import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { BillingAccount, BillingStatus, PricingTier } from './entities/billing-account.entity';
import { BillingTransaction, TransactionType, TransactionStatus } from './entities/billing-transaction.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { BillingInfoDto, PricingPlanDto } from './dto/billing-info.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class BillingService {
  private stripe: Stripe;
  private billingCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds cache

  constructor(
    @InjectRepository(BillingAccount)
    private billingAccountRepository: Repository<BillingAccount>,
    @InjectRepository(BillingTransaction)
    private billingTransactionRepository: Repository<BillingTransaction>,
    private storageService: StorageService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async getOrCreateBillingAccount(businessId: string): Promise<BillingAccount> {
    let billingAccount = await this.billingAccountRepository.findOne({
      where: { businessId },
    });

    if (!billingAccount) {
      billingAccount = this.billingAccountRepository.create({
        businessId,
        billingStatus: BillingStatus.TRIALING,
        pricingTier: PricingTier.FREE,
        storageLimitGb: 1.0,
        monthlyPriceCents: 0,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial for FREE tier
      });
      billingAccount = await this.billingAccountRepository.save(billingAccount);
      
      // Initialize storage limit in storage service
      await this.storageService.updateStorageLimit(businessId, 1.0);
    } else {
      // Ensure storage service has the current limit
      await this.storageService.updateStorageLimit(businessId, billingAccount.storageLimitGb);
    }

    return billingAccount;
  }

  async getBillingInfo(businessId: string): Promise<BillingInfoDto> {
    // Check cache first
    const cached = this.billingCache.get(businessId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const billingAccount = await this.getOrCreateBillingAccount(businessId);
    const storageInfo = await this.storageService.getUsageForBusiness(businessId);

    // Storage info logging removed for performance

    const storageUsageGb = Math.round((storageInfo.bytesUsed / (1024 * 1024 * 1024)) * 1000) / 1000; // Keep 3 decimal places
    const actualStorageLimitGb = Math.round((storageInfo.bytesLimit / (1024 * 1024 * 1024)) * 100) / 100; // Use actual limit from storage service
    const storageUsagePercentage = actualStorageLimitGb > 0 
      ? Math.round((storageUsageGb / actualStorageLimitGb) * 100 * 100) / 100 // Keep 2 decimal places
      : 0;

    // Storage calculations completed

    const isTrialActive = billingAccount.trialEndsAt && billingAccount.trialEndsAt > new Date();
    const daysUntilTrialEnd = isTrialActive 
      ? Math.ceil((billingAccount.trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : 0;

    const result = {
      id: billingAccount.id,
      businessId: billingAccount.businessId,
      billingStatus: billingAccount.billingStatus,
      pricingTier: billingAccount.pricingTier,
      storageLimitGb: actualStorageLimitGb,
      monthlyPriceCents: billingAccount.monthlyPriceCents,
      trialEndsAt: billingAccount.trialEndsAt,
      currentPeriodStart: billingAccount.currentPeriodStart,
      currentPeriodEnd: billingAccount.currentPeriodEnd,
      storageUsageGb,
      storageUsagePercentage,
      isTrialActive,
      daysUntilTrialEnd,
    };

    // Cache the result
    this.billingCache.set(businessId, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }

  async getPricingPlans(): Promise<PricingPlanDto[]> {
    // Get actual Stripe price IDs from environment or use null for development
    const freePriceId = this.configService.get("STRIPE_PRICE_TIER_FREE");
    const starterPriceId = this.configService.get("STRIPE_PRICE_TIER_STARTER");
    const professionalPriceId = this.configService.get("STRIPE_PRICE_TIER_PROFESSIONAL");
    const enterprisePriceId = this.configService.get("STRIPE_PRICE_TIER_ENTERPRISE");

    return [
      {
        tier: PricingTier.FREE,
        name: 'Free',
        description: 'Perfect for getting started',
        monthlyPriceCents: 0,
        storageLimitGb: 1,
        features: ['1GB storage', 'Basic widgets', 'Email support'],
        stripePriceId: freePriceId && freePriceId.startsWith('price_') ? freePriceId : null,
        isPopular: false,
      },
      {
        tier: PricingTier.STARTER,
        name: 'Starter',
        description: 'Great for small businesses',
        monthlyPriceCents: 1900, // $19.00
        storageLimitGb: 10,
        features: ['10GB storage', 'All widget styles', 'Priority support', 'Analytics dashboard'],
        stripePriceId: starterPriceId && starterPriceId.startsWith('price_') ? starterPriceId : null,
        isPopular: true,
      },
      {
        tier: PricingTier.PROFESSIONAL,
        name: 'Professional',
        description: 'For growing businesses',
        monthlyPriceCents: 4900, // $49.00
        storageLimitGb: 50,
        features: ['50GB storage', 'Custom branding', 'Advanced analytics', 'API access', 'Phone support'],
        stripePriceId: professionalPriceId && professionalPriceId.startsWith('price_') ? professionalPriceId : null,
        isPopular: false,
      },
      {
        tier: PricingTier.ENTERPRISE,
        name: 'Enterprise',
        description: 'For large organizations',
        monthlyPriceCents: 9900, // $99.00
        storageLimitGb: 200,
        features: ['200GB storage', 'White-label solution', 'Dedicated support', 'Custom integrations', 'SLA'],
        stripePriceId: enterprisePriceId && enterprisePriceId.startsWith('price_') ? enterprisePriceId : null,
        isPopular: false,
      },
    ];
  }

  async createCheckoutSession(
    businessId: string,
    createCheckoutSessionDto: CreateCheckoutSessionDto,
  ): Promise<{ checkoutUrl: string; sessionId: string }> {
    const billingAccount = await this.getOrCreateBillingAccount(businessId);
    const pricingPlans = await this.getPricingPlans();
    const selectedPlan = pricingPlans.find(plan => plan.tier === createCheckoutSessionDto.pricingTier);

    if (!selectedPlan) {
      throw new BadRequestException('Invalid pricing tier selected');
    }

    if (selectedPlan.tier === PricingTier.FREE) {
      // Handle downgrade to free tier
      const updatedAccount = await this.updateSubscription(
        businessId,
        " free_tier_downgrade_" + Date.now(),
        PricingTier.FREE,
        BillingStatus.ACTIVE,
      );
      
      return {
        checkoutUrl: createCheckoutSessionDto.successUrl || `${this.configService.get('FRONTEND_URL')}/dashboard/billing?payment=success`,
        sessionId: 'free_tier_downgrade',
      };
    }

    // Development mode: Always update subscription immediately
    const isDevelopment = this.configService.get('NODE_ENV') === 'production';
    
    // Force development mode unless production is forced
    if (isDevelopment) {
      
      try {
        const updatedAccount = await this.updateSubscription(
          businessId,
          'sub_dev_mode_' + Date.now(),
          selectedPlan.tier,
          BillingStatus.ACTIVE,
        );
        
        // Create transaction record
        await this.recordTransaction(
          updatedAccount.id,
          TransactionType.PAYMENT,
          TransactionStatus.SUCCEEDED,
          selectedPlan.monthlyPriceCents,
          'pi_dev_mode_' + Date.now(),
          `${selectedPlan.name} Plan Subscription`
        );
        
        const successUrl = createCheckoutSessionDto.successUrl || `${this.configService.get('FRONTEND_URL')}/dashboard/billing?payment=success&session_id=cs_test_dev_mode`;
        
        return {
          checkoutUrl: successUrl,
          sessionId: 'cs_test_dev_mode',
        };
      } catch (error) {
        throw error;
      }
    }
    
    // Production mode - require Stripe price ID
    if (!selectedPlan.stripePriceId) {
      throw new Error(`Stripe price ID not configured for ${selectedPlan.tier} tier. Please contact support.`);
    }

    if (!selectedPlan.stripePriceId.startsWith('price_')) {
      throw new Error(`Invalid Stripe price ID format: ${selectedPlan.stripePriceId}. Expected format: price_xxx`);
    }

    // Ensure customer exists in Stripe
    let stripeCustomerId = billingAccount.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        metadata: {
          businessId: businessId,
        },
      });
      stripeCustomerId = customer.id;
      
      // Update billing account with Stripe customer ID
      billingAccount.stripeCustomerId = stripeCustomerId;
      await this.billingAccountRepository.save(billingAccount);
    }

    // Create Stripe checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: createCheckoutSessionDto.successUrl || `${this.configService.get('FRONTEND_URL')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: createCheckoutSessionDto.cancelUrl || `${this.configService.get('FRONTEND_URL')}/billing/cancel`,
      metadata: {
        businessId: businessId,
        pricingTier: selectedPlan.tier,
      },
    });

    return {
      checkoutUrl: session.url || '',
      sessionId: session.id,
    };
  }

  async createCustomerPortalSession(businessId: string): Promise<{ portalUrl: string }> {
    const billingAccount = await this.getOrCreateBillingAccount(businessId);

    if (!billingAccount.stripeCustomerId) {
      throw new Error('No Stripe customer found. Please subscribe to a plan first.');
    }

    // Create Stripe customer portal session
    const session = await this.stripe.billingPortal.sessions.create({
      customer: billingAccount.stripeCustomerId,
      return_url: `${this.configService.get('FRONTEND_URL')}/billing`,
    });

    return { portalUrl: session.url };
  }

  async updateSubscription(
    businessId: string,
    stripeSubscriptionId: string,
    pricingTier: PricingTier,
    billingStatus: BillingStatus,
  ): Promise<BillingAccount> {
    const billingAccount = await this.getOrCreateBillingAccount(businessId);
    const pricingPlans = await this.getPricingPlans();
    const selectedPlan = pricingPlans.find(plan => plan.tier === pricingTier);
    
    if (!selectedPlan) {
      throw new Error(`No plan found for tier: ${pricingTier}`);
    }

    billingAccount.stripeSubscriptionId = stripeSubscriptionId;
    billingAccount.pricingTier = pricingTier;
    billingAccount.billingStatus = billingStatus;
    billingAccount.storageLimitGb = selectedPlan.storageLimitGb;
    billingAccount.monthlyPriceCents = selectedPlan.monthlyPriceCents;
    billingAccount.currentPeriodStart = new Date();
    
    // Set billing period based on tier
    if (pricingTier === PricingTier.FREE) {
      // FREE tier gets 7 days trial, then expires
      billingAccount.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      billingAccount.currentPeriodEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      billingAccount.billingStatus = BillingStatus.TRIALING;
    } else {
      // Paid plans get 30 days billing cycle
      billingAccount.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      billingAccount.trialEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Far future date for paid plans
    }

    const savedAccount = await this.billingAccountRepository.save(billingAccount);
    
    // Update storage service with new limits
    await this.storageService.updateStorageLimit(businessId, selectedPlan.storageLimitGb);
    
    return savedAccount;
  }

  async recordTransaction(
    billingAccountId: string,
    transactionType: TransactionType,
    transactionStatus: TransactionStatus,
    amountCents: number,
    stripePaymentIntentId?: string,
    description?: string,
  ): Promise<BillingTransaction> {
    const transaction = this.billingTransactionRepository.create({
      billingAccountId,
      transactionType,
      transactionStatus,
      amountCents,
      stripePaymentIntentId,
      description,
      currency: 'USD',
    });

    return this.billingTransactionRepository.save(transaction);
  }

  async isStorageExceeded(businessId: string): Promise<boolean> {
    const billingInfo = await this.getBillingInfo(businessId);
    return billingInfo.storageUsageGb > billingInfo.storageLimitGb;
  }

  async canAccessFeature(businessId: string, feature: string): Promise<boolean> {
    const billingAccount = await this.getOrCreateBillingAccount(businessId);
    
    // Check if billing is active or in trial
    if (billingAccount.billingStatus === BillingStatus.CANCELED || 
        billingAccount.billingStatus === BillingStatus.PAST_DUE) {
      return false;
    }

    // Feature-specific checks
    switch (feature) {
      case 'storage':
        return !(await this.isStorageExceeded(businessId));
      
      case 'analytics':
        return billingAccount.pricingTier !== PricingTier.FREE;
      
      case 'custom_branding':
        return [PricingTier.PROFESSIONAL, PricingTier.ENTERPRISE].includes(billingAccount.pricingTier);
      
      case 'api_access':
        return [PricingTier.PROFESSIONAL, PricingTier.ENTERPRISE].includes(billingAccount.pricingTier);
      
      case 'white_label':
        return billingAccount.pricingTier === PricingTier.ENTERPRISE;
      
      case 'priority_support':
        return billingAccount.pricingTier !== PricingTier.FREE;
      
      case 'unlimited_widgets':
        // Free tier gets 1 widget, paid tiers get unlimited
        return true; // Allow widget creation, limit will be checked in frontend
      
      default:
        return true;
    }
  }

  async verifyWebhook(body: any, signature: string, webhookSecret: string): Promise<any> {
    try {
      return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error.message);
      throw new Error('Webhook signature verification failed');
    }
  }
}
