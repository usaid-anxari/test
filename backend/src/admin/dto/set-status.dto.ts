import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class SetStatusDto {
  @ApiProperty({ enum: ['pending', 'approved', 'rejected', 'hidden'] })
  @IsIn(['pending', 'approved', 'rejected', 'hidden'])
  status: string;
}
