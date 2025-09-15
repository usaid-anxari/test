import { forwardRef, Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadService } from './upload.service';
import { BusinessModule } from '../business/business.module';
import { ReviewsModule } from '../review/review.module';
import { TranscodeModule } from 'src/transcode/transcode.module';
console.log(BusinessModule, ReviewsModule,TranscodeModule);

@Module({
  imports: [BusinessModule, ReviewsModule,TranscodeModule],
  controllers: [UploadsController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadsModule {}
