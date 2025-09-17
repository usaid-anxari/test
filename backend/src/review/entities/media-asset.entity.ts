import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Review } from './review.entity';

@Entity({ name: 'media_assets' })
@Index('ix_media_assets_business_id_review_id', ['businessId', 'reviewId'])
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'review_id' })
  reviewId: string;

  @ManyToOne(() => Review, (review) => review.mediaAssets)
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ name: 'asset_type' }) // 'video' | 'audio' | 'thumbnail'
  assetType: string;

  @Column({ name: 's3_key' })
  s3Key: string;

  @Column({ name: 'duration_sec', type: 'int', nullable: true })
  durationSec?: number;

  @Column({ name: 'size_bytes', type: 'bigint', nullable: true })
  sizeBytes?: number;

  @Column({ name: 'metadata_json', type: 'json', nullable: true })
  metadataJson?: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
