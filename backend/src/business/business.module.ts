import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessUser } from './entities/business-user.entity';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { S3Service } from '../common/s3/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessUser, User]),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    ConfigModule,
  ],
  providers: [BusinessService, S3Service], // Add S3Service here
  controllers: [BusinessController],
  exports: [BusinessService],
})
export class BusinessModule {}