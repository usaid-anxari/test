import { IsString, IsOptional, IsEmail, IsUrl, IsObject, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateBusinessDto {
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  slug: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Business name is required' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsNumber()
  foundedYear?: number;

  @IsOptional()
  @IsString()
  brandColor?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  businessHours?: any;

  @IsOptional()
  socialLinks?: any;

  @IsOptional()
  @IsString()
  logoFile?: any;

  @IsOptional()
  @IsString()
  bannerFile?: any;

  @IsOptional()
  @IsObject()
  settingsJson?: any;
}