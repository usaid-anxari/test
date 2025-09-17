import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum EmailType {
  WELCOME = 'welcome',
  REVIEW_NOTIFICATION = 'review_notification',
  TRIAL_EXPIRING = 'trial_expiring',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  PAYMENT_FAILED = 'payment_failed',
  STORAGE_WARNING = 'storage_warning',
  FEATURE_UPDATE = 'feature_update',
  PASSWORD_RESET = 'password_reset'
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced'
}

@Entity('email_logs')
@Index('ix_email_logs_business_id', ['businessId'])
@Index('ix_email_logs_email_type', ['emailType'])
@Index('ix_email_logs_status', ['status'])
@Index('ix_email_logs_created_at', ['createdAt'])
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id', nullable: true })
  businessId: string;

  @Column({ name: 'recipient_email' })
  recipientEmail: string;

  @Column({ name: 'recipient_name', nullable: true })
  recipientName: string;

  @Column({
    type: 'enum',
    enum: EmailType,
    name: 'email_type'
  })
  emailType: EmailType;

  @Column({ name: 'subject' })
  subject: string;

  @Column({ name: 'template_data', type: 'jsonb', nullable: true })
  templateData: Record<string, any>;

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.PENDING,
    name: 'status'
  })
  status: EmailStatus;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}