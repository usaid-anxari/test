import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'transcode_jobs' })
@Index('ix_transcode_jobs_business_id_review_id', ['businessId', 'reviewId'])
export class TranscodeJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'review_id' })
  reviewId: string;

  @Column({ name: 'input_asset_id' })
  inputAssetId: string;

  @Column({ name: 'target' })
  target: string; // e.g. '720p-h264-1mbps'

  @Column({ name: 'status', default: 'queued' })
  status: 'queued' | 'processing' | 'done' | 'error';

  @Column({ name: 'error', nullable: true })
  error?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
