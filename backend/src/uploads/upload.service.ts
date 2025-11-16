import { Injectable, Logger } from '@nestjs/common';
import { 
  S3Client, 
  CreateMultipartUploadCommand, 
  CompleteMultipartUploadCommand, 
  AbortMultipartUploadCommand,
  GetObjectCommand,
  UploadPartCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get('AWS_S3_BUCKET') || '';
    const region = this.config.get('AWS_REGION') || 'us-east-1';
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    // In Lambda, use IAM role credentials (don't specify credentials)
    // In local dev, use explicit credentials from env
    this.s3 = new S3Client({ 
      region,
      ...(isLambda ? {} : {
        credentials: {
          accessKeyId: this.config.get('AWS_ACCESS_KEY_ID') || "",
          secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY') || "",
        }
      })
    });
  }

  async initMultipartUpload(businessId: string, filename: string, contentType: string) {
    const s3Key = `businesses/${businessId}/reviews/originals/${Date.now()}-${filename}`;
    const cmd = new CreateMultipartUploadCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: contentType,
      ServerSideEncryption: 'AES256',
    });
    const res = await this.s3.send(cmd);
    return { s3Key, uploadId: res.UploadId };
  }

  async presignUploadPart(s3Key: string, uploadId: string, partNumber: number, expiresSeconds = 900) {
    const cmd = new UploadPartCommand({
      Bucket: this.bucket,
      Key: s3Key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });
    return getSignedUrl(this.s3, cmd, { expiresIn: expiresSeconds });
  }

  async completeMultipartUpload(s3Key: string, uploadId: string, parts: { ETag: string; PartNumber: number }[]) {
    const cmd = new CompleteMultipartUploadCommand({
      Bucket: this.bucket,
      Key: s3Key,
      UploadId: uploadId,
      MultipartUpload: { 
        Parts: parts.map(p => ({ 
          ETag: p.ETag, 
          PartNumber: p.PartNumber 
        })) 
      },
    });
    const res = await this.s3.send(cmd);
    return res;
  }

  async abortMultipartUpload(s3Key: string, uploadId: string) {
    const cmd = new AbortMultipartUploadCommand({
      Bucket: this.bucket,
      Key: s3Key,
      UploadId: uploadId,
    });
    return this.s3.send(cmd);
  }

  async getPresignedGetUrl(s3Key: string, expiresSeconds = 300) {
    const cmd = new GetObjectCommand({ 
      Bucket: this.bucket, 
      Key: s3Key 
    });
    return getSignedUrl(this.s3, cmd, { expiresIn: expiresSeconds });
  }
}