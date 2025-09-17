import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'google_connections' })
@Index('ix_google_connections_business_id', ['businessId'])
export class GoogleConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'business_id' })
  businessId: string;

  @Column({ name: 'google_account_id', nullable: true })
  googleAccountId: string;

  @Column({ name: 'location_id', nullable: true })
  locationId: string;

  @Column({ name: 'access_token', nullable: true })
  accessToken: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({ name: 'status', default: 'connected' })
  status: 'connected' | 'disconnected' | 'error';

  @Column({ name: 'connected_at', type: 'timestamp', nullable: true })
  connectedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}