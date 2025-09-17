import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { GoogleConnection } from './entities/google-connection.entity';
import { GoogleReview } from './entities/google-review.entity';
import { BusinessModule } from '../business/business.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoogleConnection, GoogleReview]),
    forwardRef(() => BusinessModule),
    forwardRef(() => AuthModule),
    ConfigModule,
  ],
  providers: [GoogleService],
  controllers: [GoogleController],
  exports: [GoogleService],
})
export class GoogleModule {}
