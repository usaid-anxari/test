import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private client: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get('AWS_S3_BUCKET') || '';
    this.client = new S3Client({
      region: this.config.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadStream(
    s3Key: string, 
    stream: Readable, 
    contentLength?: number, 
    contentType?: string
  ) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: stream,
        ContentLength: contentLength,
        ContentType: contentType,
        ServerSideEncryption: 'AES256', // Added encryption
      });
      
      await this.client.send(command);
      this.logger.log(`File uploaded to S3: ${s3Key}`);
      
      return { 
        bucket: this.bucket, 
        key: s3Key,
        url: await this.getSignedUrl(s3Key) 
      };
    } catch (err) {
      this.logger.error('S3 upload error', err);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  // Proper signed URL generation for GET requests
  async getSignedUrl(key: string, expiresInSeconds = 300): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      return await getSignedUrl(this.client, command, { 
        expiresIn: expiresInSeconds 
      });
    } catch (err) {
      this.logger.error('Failed to generate signed URL', err);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }

  // Check if object exists and get metadata
  async getObjectMetadata(key: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      const response = await this.client.send(command);
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
      };
    } catch (err) {
      this.logger.error(`Object not found: ${key}`, err);
      return null;
    }
  }

  // Generate S3 key with proper structure
  generateS3Key(businessId: string, reviewId: string, filename: string): string {
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `businesses/${businessId}/reviews/${reviewId}/${timestamp}-${safeFilename}`;
  }

  // Delete file from S3 (for right-to-delete compliance)
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      await this.client.send(command);
      this.logger.log(`File deleted from S3: ${key}`);
    } catch (err) {
      this.logger.error(`Failed to delete S3 file: ${key}`, err);
      throw new InternalServerErrorException('Failed to delete file from S3');
    }
  }
}