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
    const region = this.config.get('AWS_REGION') || 'us-east-1';
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    this.logger.log(`S3 Service initialized - Bucket: ${this.bucket}, Region: ${region}, IsLambda: ${isLambda}`);
    
    // In Lambda, use IAM role (no explicit credentials needed)
    // In local dev, use explicit credentials from env
    this.client = new S3Client({
      region,
      ...(isLambda ? {} : {
        credentials: {
          accessKeyId: this.config.get('AWS_ACCESS_KEY_ID') || '',
          secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY') || '',
        }
      })
    });
    
    this.logger.log(`S3 Client configured for ${isLambda ? 'Lambda (IAM Role)' : 'Local (Explicit Credentials)'}`);
    
    if (!this.bucket) {
      this.logger.error('AWS_S3_BUCKET not configured!');
    }
  }

  async uploadBuffer(
    s3Key: string,
    buffer: Buffer,
    contentType?: string
  ) {
    try {
      this.logger.log(`🔥🔥🔥 S3 BUFFER UPLOAD START: ${s3Key}`);
      this.logger.log(`🔥🔥🔥 Buffer type: ${typeof buffer}, isBuffer: ${Buffer.isBuffer(buffer)}, length: ${buffer?.length}`);
      
      if (!buffer || buffer.length === 0) {
        throw new Error('Buffer is empty or null');
      }
      
      // Log first 100 bytes to verify buffer has data
      this.logger.log(`🔥🔥🔥 Buffer first 100 bytes: ${buffer.slice(0, 100).toString('hex')}`);
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length,
      });
      
      const result = await this.client.send(command);
      this.logger.log(`🔥🔥🔥 S3 upload SUCCESS: ${s3Key}, ETag: ${result.ETag}`);
      
      const metadata = await this.getObjectMetadata(s3Key);
      this.logger.log(`🔥🔥🔥 File verified: size=${metadata?.contentLength}, type=${metadata?.contentType}`);
      
      if (metadata?.contentLength !== buffer.length) {
        this.logger.error(`🔥🔥🔥 SIZE MISMATCH: Uploaded ${buffer.length}, S3 has ${metadata?.contentLength}`);
      }
      
      return { 
        bucket: this.bucket, 
        key: s3Key,
        url: `https://${this.bucket}.s3.us-east-1.amazonaws.com/${s3Key}`
      };
    } catch (err) {
      this.logger.error(`🔥🔥🔥 S3 upload FAILED: ${err.message}`);
      throw new InternalServerErrorException(`Failed to upload file to S3: ${err.message}`);
    }
  }

  async uploadStream(
    s3Key: string, 
    stream: Readable, 
    contentLength?: number, 
    contentType?: string
  ) {
    try {
      this.logger.log(`🔥🔥🔥 S3 UPLOAD START: ${s3Key} to bucket: ${this.bucket}`);
      this.logger.log(`🔥🔥🔥 Stream details - ContentLength: ${contentLength}, ContentType: ${contentType}`);
      this.logger.log(`🔥🔥🔥 Stream readable: ${stream.readable}, destroyed: ${stream.destroyed}`);
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: stream,
        ContentLength: contentLength,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      });
      
      const result = await this.client.send(command);
      this.logger.log(`🔥🔥🔥 S3 upload SUCCESS: ${s3Key}, ETag: ${result.ETag}`);
      
      // Verify file actually exists and get metadata
      try {
        const metadata = await this.getObjectMetadata(s3Key);
        this.logger.log(`🔥🔥🔥 File verified on S3: ${s3Key}, size: ${metadata?.contentLength}, type: ${metadata?.contentType}`);
        
        // Check if file size matches expected
        if (contentLength && metadata?.contentLength !== contentLength) {
          this.logger.warn(`🔥🔥🔥 SIZE MISMATCH: Expected ${contentLength}, got ${metadata?.contentLength}`);
        }
      } catch (verifyError) {
        this.logger.error(`🔥🔥🔥 File upload succeeded but verification failed: ${s3Key}`, verifyError);
        throw new InternalServerErrorException('File upload verification failed');
      }
      
      return { 
        bucket: this.bucket, 
        key: s3Key,
        url: `https://${this.bucket}.s3.us-east-1.amazonaws.com/${s3Key}`
      };
    } catch (err) {
      this.logger.error(`🔥🔥🔥 S3 upload FAILED for ${s3Key}:`, {
        error: err.message,
        code: err.Code,
        statusCode: err.$metadata?.httpStatusCode,
        bucket: this.bucket,
        region: this.config.get('AWS_REGION')
      });
      throw new InternalServerErrorException(`Failed to upload file to S3: ${err.message}`);
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