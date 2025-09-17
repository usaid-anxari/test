import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BillingAccount } from './billing-account.entity';

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  CHARGEBACK = 'chargeback',
  ADJUSTMENT = 'adjustment'
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

@Entity('billing_transactions')
@Index('ix_billing_transactions_billing_account_id', ['billingAccountId'])
@Index('ix_billing_transactions_stripe_payment_intent_id', ['stripePaymentIntentId'])
@Index('ix_billing_transactions_created_at', ['createdAt'])
export class BillingTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'billing_account_id' })
  billingAccountId: string;

  @Column({ name: 'stripe_payment_intent_id', nullable: true })
  stripePaymentIntentId: string;

  @Column({ name: 'stripe_invoice_id', nullable: true })
  stripeInvoiceId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    name: 'transaction_type'
  })
  transactionType: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    name: 'transaction_status'
  })
  transactionStatus: TransactionStatus;

  @Column({ name: 'amount_cents', type: 'integer' })
  amountCents: number;

  @Column({ name: 'currency', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => BillingAccount)
  @JoinColumn({ name: 'billing_account_id' })
  billingAccount: BillingAccount;
}