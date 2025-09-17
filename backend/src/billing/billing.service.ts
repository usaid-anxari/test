import { Injectable } from '@nestjs/common';
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
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      });
      billingAccount = await this.billingAccountRepository.save(billingAccount);
    }

    return billingAccount;
  }

  async getBillingInfo(businessId: string): Promise<BillingInfoDto> {
    const billingAccount = await this.getOrCreateBillingAccount(businessId);
    const storageInfo = await this.storageService.getUsageForBusiness(businessId);

    const storageUsageGb = Math.round((storageInfo.bytesUsed / (1024 * 1024 * 1024)) * 100) / 100;
    const storageUsagePercentage = billingAccount.storageLimitGb > 0 
      ? (storageUsageGb / billingAccount.storageLimitGb) * 100 
      : 0;

    const isTrialActive = billingAccount.trialEndsAt && billingAccount.trialEndsAt > new Date();
    const daysUntilTrialEnd = isTrialActive 
      ? Math.ceil((billingAccount.trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : 0;

    return {
      id: billingAccount.id,
      businessId: billingAccount.businessId,
      billingStatus: billingAccount.billingStatus,
      pricingTier: billingAccount.pricingTier,
      storageLimitGb: billingAccount.storageLimitGb,
      monthlyPriceCents: billingAccount.monthlyPriceCents,
      trialEndsAt: billingAccount.trialEndsAt,
      currentPeriodStart: billingAccount.currentPeriodStart,
      currentPeriodEnd: billingAccount.currentPeriodEnd,
      storageUsageGb,
      storageUsagePercentage: Math.round(storageUsagePercentage * 100) / 100,
      isTrialActive,
      daysUntilTrialEnd,
    };
  }

  async getPricingPlans(): Promise<PricingPlanDto[]> {
    return [
      {
        tier: PricingTier.FREE,
        name: 'Free',
        description: 'Perfect for getting started',
        monthlyPriceCents: 0,
        storageLimitGb: 1,
        features: ['1GB storage', 'Basic widgets', 'Email support'],
        stripePriceId: null,
        isPopular: false,
      },
      {
        tier: PricingTier.STARTER,
        name: 'Starter',
        description: 'Great for small businesses',
        monthlyPriceCents: 1900, // $19.00
        storageLimitGb: 10,
        features: ['10GB storage', 'All widget styles', 'Priority support', 'Analytics dashboard'],
        stripePriceId: 'price_starter_monthly',
        isPopular: true,
      },
      {
        tier: PricingTier.PROFESSIONAL,
        name: 'Professional',
        description: 'For growing businesses',
        monthlyPriceCents: 4900, // $49.00
        storageLimitGb: 50,
        features: ['50GB storage', 'Custom branding', 'Advanced analytics', 'API access', 'Phone support'],
        stripePriceId: 'price_professional_monthly',
        isPopular: false,
      },
      {
        tier: PricingTier.ENTERPRISE,
        name: 'Enterprise',
        description: 'For large organizations',
        monthlyPriceCents: 9900, // $99.00
        storageLimitGb: 200,
        features: ['200GB storage', 'White-label solution', 'Dedicated support', 'Custom integrations', 'SLA'],
        stripePriceId: 'price_enterprise_monthly',
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

    if (!selectedPlan || selectedPlan.tier === PricingTier.FREE || !selectedPlan.stripePriceId) {
      throw new Error('Invalid pricing tier for checkout');
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

    if (selectedPlan) {
      billingAccount.stripeSubscriptionId = stripeSubscriptionId;
      billingAccount.pricingTier = pricingTier;
      billingAccount.billingStatus = billingStatus;
      billingAccount.storageLimitGb = selectedPlan.storageLimitGb;
      billingAccount.monthlyPriceCents = selectedPlan.monthlyPriceCents;
      billingAccount.currentPeriodStart = new Date();
      billingAccount.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    return this.billingAccountRepository.save(billingAccount);
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

    // Check storage limits
    if (feature === 'storage' && await this.isStorageExceeded(businessId)) {
      return false;
    }

    return true;
  }
}
