import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'type: text | video | audio', example: 'video' })
  @IsString()
  type: 'text' | 'video' | 'audio';

  @ApiPropertyOptional({ description: 'Title (optional)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Text body (for text reviews or caption)' })
  @IsOptional()
  @IsString()
  bodyText?: string;

  @ApiPropertyOptional({ description: 'Rating 1-5' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Reviewer name (optional)' })
  @IsOptional()
  @IsString()
  reviewerName?: string;
  
  @ApiPropertyOptional({ description: 'Reviewer name (optional)' })
  @IsOptional()
  @IsString()
  reviewerContactJson?: string;

  @ApiProperty({ description: 'Consent must be checked', example: true })
  @IsBoolean()
  consentChecked: boolean;
}
