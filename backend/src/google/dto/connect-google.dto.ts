import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectGoogleDto {
  @ApiProperty({ description: 'Google OAuth authorization code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Google Business location ID', required: false })
  @IsOptional()
  @IsString()
  locationId?: string;
}