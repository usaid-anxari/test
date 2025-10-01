import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWidgetDto {
  @ApiProperty({ description: 'Widget name' })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Widget style',
    enum: ['grid', 'carousel', 'spotlight', 'floating']
  })
  @IsEnum(['grid', 'carousel', 'spotlight', 'floating'])
  style: 'grid' | 'carousel' | 'spotlight' | 'floating';

  @ApiProperty({ description: 'Widget settings', required: false })
  @IsOptional()
  @IsObject()
  settingsJson?: any;
}