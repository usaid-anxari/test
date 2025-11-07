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

  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'address', nullable: true })
  address: string;

  @Column({ name: 'city', nullable: true })
  city: string;

  @Column({ name: 'state', nullable: true })
  state: string;

  @Column({ name: 'country', nullable: true })
  country: string;

  @Column({ name: 'postal_code', nullable: true })
  postalCode: string;

  @Column({ name: 'industry', nullable: true })
  industry: string;

  @Column({ name: 'company_size', nullable: true })
  companySize: string;

  @Column({ name: 'founded_year', nullable: true })
  foundedYear: number;

  @Column({ name: 'banner_url', nullable: true })
  bannerUrl: string;

  @Column({ name: 'business_hours', type: 'json', nullable: true })
  businessHours: any;

  @Column({ name: 'social_links', type: 'json', nullable: true })
  socialLinks: any;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'settings_json', type: 'json', nullable: true })
  settingsJson: any;

  @Column({ name: 'last_viewed_at', type: 'timestamp', nullable: true })
  lastViewedAt: Date;

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
