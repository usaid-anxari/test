import { MediaAsset } from '../../review/entities/media-asset.entity';
import { Review } from '../../review/entities/review.entity';
import {
  Entity,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'businesses' })
@Index('uq_businesses_slug', ['slug'], { unique: true })
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'slug' })
  slug: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'brand_color', nullable: true })
  brandColor: string;

  @Column({ name: 'website', nullable: true })
  website: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string;

  @Column({ name: 'settings_json', type: 'json', nullable: true })
  settingsJson: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', nullable: true, type: 'timestamp' })
  deletedAt?: Date;

  @OneToMany(() => Review, (review) => review.business)
  reviews: Review[];

  @OneToMany(() => MediaAsset, (asset) => asset.businessId)
  mediaAssets: MediaAsset[];
}
