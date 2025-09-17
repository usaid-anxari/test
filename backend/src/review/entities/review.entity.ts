import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Business } from '../../business/entities/business.entity';
import { MediaAsset } from './media-asset.entity';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

@Entity({ name: 'reviews' })
@Index('ix_reviews_business_id_status', ['businessId', 'status'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @ManyToOne(() => Business, (biz) => biz.reviews)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @OneToMany(() => MediaAsset, (asset) => asset.review, { cascade: true })
  mediaAssets: MediaAsset[];

  @Column({ name: 'type' })
  type: 'text' | 'video' | 'audio' | 'import';

  @Column({ name: 'status', default: 'pending' })
  status: ReviewStatus;

  @Column({ name: 'title', nullable: true })
  title?: string;

  @Column({ name: 'body_text', type: 'text', nullable: true })
  bodyText?: string;

  @Column({ name: 'rating', nullable: true, type: 'int' })
  rating?: number;

  @Column({ name: 'reviewer_name', nullable: true })
  reviewerName?: string;

  @Column({ name: 'reviewer_contact_json', type: 'json', nullable: true })
  reviewerContactJson?: any;

  @Column({ name: 'consent_checked', default: false })
  consentChecked: boolean;

  @Column({ name: 'source', nullable: true })
  source?: string; // e.g. 'public', 'google'

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt?: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date | null;
}
