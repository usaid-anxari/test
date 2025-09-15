import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get('AWS_S3_BUCKET') || "";
    this.client = new S3Client({
      region: this.config.get('AWS_REGION') || "",
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID') || "",
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY') || "",
      },
    });
  }

  async uploadStream(s3Key: string, stream: Readable, contentLength?: number, contentType?: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: stream,
        ContentLength: contentLength,
        ContentType: contentType,
      });
      await this.client.send(command);
      return { bucket: this.bucket, key: s3Key };
    } catch (err) {
      console.error('S3 upload error', err);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  getSignedUrlForKey(key: string, expiresInSec = 60 * 5) {
    // Optionally implement signed url generation using @aws-sdk/s3-request-presigner
    // but for Milestone 2 we can provide path formation; signed URLs recommended for public asset delivery.
    return `https://${this.bucket}.s3.${this.config.get('AWS_REGION')}.amazonaws.com/${key}`;
  }
}
