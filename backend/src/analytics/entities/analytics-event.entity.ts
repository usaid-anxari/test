import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Business } from '../../business/entities/business.entity';
import { Widget } from '../../widgets/entities/widget.entity';

export enum AnalyticsEventType {
  VIEW = 'view',
  CLICK = 'click',
  SUBMISSION = 'submission',
  WIDGET_VIEW = 'widget_view',
  WIDGET_CLICK = 'widget_click',
  REVIEW_SUBMISSION = 'review_submission'
}

@Entity('analytics_events')
@Index('ix_analytics_events_business_id', ['businessId'])
@Index('ix_analytics_events_widget_id', ['widgetId'])
@Index('ix_analytics_events_event_type', ['eventType'])
@Index('ix_analytics_events_created_at', ['createdAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'widget_id', nullable: true })
  widgetId: string;

  @Column({
    type: 'enum',
    enum: AnalyticsEventType,
    name: 'event_type'
  })
  eventType: AnalyticsEventType;

  @Column({ name: 'event_data', type: 'jsonb', nullable: true })
  eventData: Record<string, any>;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'referrer_url', nullable: true })
  referrerUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @ManyToOne(() => Widget, { nullable: true })
  @JoinColumn({ name: 'widget_id' })
  widget: Widget;
}