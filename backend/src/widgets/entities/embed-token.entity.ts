import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'embed_tokens' })
@Index('uq_embed_tokens_token', ['token'], { unique: true })
export class EmbedToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'widget_id' })
  widgetId: string;

  @Column({ name: 'token', unique: true })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}