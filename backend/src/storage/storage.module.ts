import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
// import { StorageController } from './storage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/review/entities/review.entity';
import { MediaAsset } from 'src/review/entities/media-asset.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
      TypeOrmModule.forFeature([Review, MediaAsset]),
      ConfigModule,
    ],
  // controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
