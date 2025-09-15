import { Module } from '@nestjs/common';
import { TranscodeService } from './transcode.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranscodeJob } from 'src/review/entities/transcode-job.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TranscodeJob])],
  providers: [TranscodeService],
  exports: [TranscodeService],
})
export class TranscodeModule {}
