import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { BusinessUser } from '../business/entities/business-user.entity';
import * as dotenv from 'dotenv';

dotenv.config()
export const AppDataSource = new DataSource({
  type: 'postgres', // ya mysql agar aap mysql use kar rahe ho
  host: process.env.DB_HOST,
  port: 5432, // mysql -> 3306
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // development ke liye true, production me false
  logging: false,
  entities: [User, Business, BusinessUser],
  migrations: [],
  subscribers: [],
});
