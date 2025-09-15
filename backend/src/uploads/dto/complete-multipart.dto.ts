import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray } from 'class-validator';

export class CompleteMultipartDto {
  @ApiProperty({ description: 'S3 key returned at init' })
  @IsString()
  s3Key: string;

  @ApiProperty({ description: 'UploadId returned at init' })
  @IsString()
  uploadId: string;

  @ApiProperty({ description: 'Parts array with ETag and PartNumber' })
  @IsArray()
  parts: Array<{ ETag: string; PartNumber: number }>;
}
