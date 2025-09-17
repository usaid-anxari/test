import { PartialType } from '@nestjs/swagger';
import { StorageUsageDto } from './storage-usage.dto';

export class UpdateStorageDto extends PartialType(StorageUsageDto) {}
