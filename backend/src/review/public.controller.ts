import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './review.service';
import { ReviewResponseDto } from './dto/response-review.dto';

@ApiTags('Public Reviews')
@Controller('public/:slug/reviews')
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  async listApproved(
    @Param('slug') slug: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    const business = await this.reviewsService.findBusinessBySlug(slug);
    if (!business) {
      throw new Error('Business not found');
    }

    const reviewsData = await this.reviewsService.getApprovedReviewsWithMedia(
      slug,
      Number(page),
      Number(limit),
    );

    return {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        logoUrl: business.logoUrl,
        brandColor: business.brandColor,
      },
      ...reviewsData,
    };
  }
}
