import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ValidationService } from './validation.service';

@ApiTags('Validation')
@Controller('api/validation')
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Get('slug/:slug')
  @ApiResponse({ status: 200, description: 'Slug availability check' })
  async checkSlugAvailability(@Param('slug') slug: string) {
    const isAvailable = await this.validationService.isSlugAvailable(slug);
    return {
      slug,
      available: isAvailable,
      message: isAvailable ? 'Slug is available' : 'Slug is already taken'
    };
  }

  @Get('suggest-slug')
  @ApiResponse({ status: 200, description: 'Slug suggestions based on business name' })
  async suggestSlug(@Query('name') name: string) {
    const suggestions = await this.validationService.generateSlugSuggestions(name);
    return {
      name,
      suggestions
    };
  }
}