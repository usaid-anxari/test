import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToOne, JoinColumn } from 'typeorm';
import { Business } from '../../business/entities/business.entity';

export enum BillingStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  TRIALING = 'trialing'
}

export enum PricingTier {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

@Entity('billing_accounts')
@Index('ix_billing_accounts_business_id', ['businessId'])
@Index('ix_billing_accounts_stripe_customer_id', ['stripeCustomerId'])
export class BillingAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id', unique: true })
  businessId: string;

  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId: string;

  @Column({ name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId: string;

  @Column({
    type: 'enum',
    enum: BillingStatus,
    default: BillingStatus.TRIALING,
    name: 'billing_status'
  })
  billingStatus: BillingStatus;

  @Column({
    type: 'enum',
    enum: PricingTier,
    default: PricingTier.FREE,
    name: 'pricing_tier'
  })
  pricingTier: PricingTier;

  @Column({ name: 'storage_limit_gb', type: 'decimal', precision: 10, scale: 2, default: 1.0 })
  storageLimitGb: number;

  @Column({ name: 'monthly_price_cents', type: 'integer', default: 0 })
  monthlyPriceCents: number;

  @Column({ name: 'trial_ends_at', type: 'timestamp', nullable: true })
  trialEndsAt: Date;

  @Column({ name: 'current_period_start', type: 'timestamp', nullable: true })
  currentPeriodStart: Date;

  @Column({ name: 'current_period_end', type: 'timestamp', nullable: true })
  currentPeriodEnd: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Business)
  @JoinColumn({ name: 'business_id' })
  business: Business;
}