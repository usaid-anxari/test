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

  @Column({ name: 'location_id', type: 'varchar', nullable: true })
  locationId: string | null;

  @Column({ name: 'access_token', type: 'varchar', nullable: true })
  accessToken: string | null;

  @Column({ name: 'refresh_token', type: 'varchar', nullable: true })
  refreshToken: string | null;

  @Column({ name: 'status', default: 'connected' })
  status: 'connected' | 'disconnected' | 'error' | 'pending_selection';

  @Column({ name: 'connected_at', type: 'timestamp', nullable: true })
  connectedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}