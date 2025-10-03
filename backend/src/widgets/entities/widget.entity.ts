import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'widgets' })
@Index('ix_widgets_business_id_is_active', ['businessId', 'isActive'])
export class Widget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'style' })
  style: 'grid' | 'carousel' | 'spotlight' | 'floating';

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'review_types', type: 'json', nullable: true })
  reviewTypes: ('video' | 'audio' | 'text')[];

  @Column({ name: 'settings_json', type: 'json', nullable: true })
  settingsJson: any;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}