import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { StorageUsageDto } from './dto/storage-usage.dto';

@ApiTags('Storage')
@Controller('api/storage/:businessId')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  @ApiResponse({ status: 200, type: StorageUsageDto })
  async getUsage(@Param('businessId') businessId: string) {
    return this.storageService.getUsageForBusiness(businessId);
  }
}
