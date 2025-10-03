import { IsString, IsEnum, IsOptional, IsObject, IsArray } from 'class-validator';
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

  @ApiProperty({ 
    description: 'Review types to display',
    type: [String],
    enum: ['video', 'audio', 'text'],
    required: false
  })
  @IsOptional()
  @IsArray()
  reviewTypes?: ('video' | 'audio' | 'text')[];

  @ApiProperty({ description: 'Widget settings', required: false })
  @IsOptional()
  @IsObject()
  settingsJson?: any;
}