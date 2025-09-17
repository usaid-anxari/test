import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'google_reviews' })
@Index('ix_google_reviews_business_id_reviewed_at', ['businessId', 'reviewedAt'])
export class GoogleReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'reviewer_name' })
  reviewerName: string;

  @Column({ name: 'rating', type: 'int' })
  rating: number;

  @Column({ name: 'text', type: 'text', nullable: true })
  text: string;

  @Column({ name: 'reviewed_at', type: 'timestamp' })
  reviewedAt: Date;

  @Column({ name: 'source_json', type: 'json', nullable: true })
  sourceJson: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}