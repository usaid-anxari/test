import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'consent_logs' })
@Index(['businessId', 'reviewId'])
export class ConsentLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  businessId: string;

  @Column({ nullable: true })
  reviewId: string;

  @Column({ nullable: true })
  action: string;

  @Column({ type: 'text', nullable: true })
  consentText: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'timestamp' })
  consentCheckedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}