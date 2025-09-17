import { ApiProperty } from '@nestjs/swagger';

export class StorageUsageDto {
  @ApiProperty({ example: 104857600 }) // 100 MB
  bytesUsed: number;

  @ApiProperty({ example: 1073741824 }) // 1 GB
  bytesLimit: number;

  @ApiProperty({ example: 23 })
  reviewCount: number;

  @ApiProperty({ example: 40 })
  mediaCount: number;
}
