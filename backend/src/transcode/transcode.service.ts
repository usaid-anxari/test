import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranscodeJob } from '../review/entities/transcode-job.entity';

@Injectable()
export class TranscodeService {
  private readonly logger = new Logger(TranscodeService.name);

  constructor(
    @InjectRepository(TranscodeJob) private jobRepo: Repository<TranscodeJob>,
  ) {}

  // This service enqueues a job record. Real worker that consumes jobs + runs ffmpeg is out of scope.
  async createTranscodeJob(businessId: string, reviewId: string, inputAssetId: string, target: string) {
    const job = this.jobRepo.create({ businessId, reviewId, inputAssetId, target, status: 'queued' });
    return this.jobRepo.save(job);
  }

  // (optional) update job status from worker
  async setJobStatus(jobId: string, status: TranscodeJob['status'], error?: string) {
    const j = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!j) return null;
    j.status = status;
    j.error = error;
    return this.jobRepo.save(j);
  }
}
