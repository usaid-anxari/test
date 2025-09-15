import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
@Index('uq_users_auth0_id', ['auth0Id'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'auth0_id', unique: true })
  auth0Id: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'name', nullable: true })
  name: string;

  @Column({ name: 'picture', nullable: true })
  picture: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
