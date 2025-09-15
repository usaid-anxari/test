import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class InitMultipartDto {
  @ApiProperty({ description: 'Original filename', example: 'review.mov' })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({ description: 'MIME type', example: 'video/mp4' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ description: 'Expected total size in bytes', example: 12345678 })
  @IsOptional()
  totalSize?: number;
}
