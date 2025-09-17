import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('email_preferences')
@Index('ix_email_preferences_business_id', ['businessId'])
@Index('ix_email_preferences_email', ['email'])
export class EmailPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id', nullable: true })
  businessId: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'review_notifications', default: true })
  reviewNotifications: boolean;

  @Column({ name: 'billing_notifications', default: true })
  billingNotifications: boolean;

  @Column({ name: 'marketing_emails', default: true })
  marketingEmails: boolean;

  @Column({ name: 'feature_updates', default: true })
  featureUpdates: boolean;

  @Column({ name: 'unsubscribed_at', type: 'timestamp', nullable: true })
  unsubscribedAt: Date;

  @Column({ name: 'unsubscribe_token', nullable: true })
  unsubscribeToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}