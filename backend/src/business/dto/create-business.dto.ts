import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength, MinLength, IsEmail } from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'Name of the business',
    example: 'Truetestify',
  })
  @IsString()
  @MinLength(2, { message: 'Business name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Business name must be at most 100 characters long' })
  name: string;

  @ApiProperty({
    description: 'Slug used in the URL (lowercase, no spaces)',
    example: 'truetestify',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  slug?: string;

  @ApiProperty({
    description: 'URL to business logo',
    example: 'https://example.com/logo.png',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'logoUrl must be a valid URL' })
  logoUrl?: string;

  @ApiProperty({
    description: 'Brand color in hex or CSS format',
    example: '#FF6600',
    required: false,
  })
  @IsOptional()
  @IsString()
  brandColor?: string;

  @ApiProperty({
    description: 'Website URL of the business',
    example: 'https://truetestify.com',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'website must be a valid URL' })
  website?: string;

  @ApiProperty({
    description: 'Contact email for the business',
    example: 'contact@truetestify.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'contactEmail must be a valid email address' })
  contactEmail?: string;

  @ApiProperty({
    description: 'Additional business settings (JSON)',
    example: { theme: 'dark' },
    required: false,
  })
  @IsOptional()
  settingsJson?: Record<string, any>;
}
