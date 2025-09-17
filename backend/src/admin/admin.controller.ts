import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/common/jwt-auth/jwt-auth.guard';

@ApiTags('admin-moderation')
@Controller('api/admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly moderation: AdminService) {}

  // --------------------------
  // LIST reviews for business
  // --------------------------
  @Get(':slug/reviews')
  @ApiOperation({ summary: 'List all reviews for a business (by slug)' })
  @ApiParam({ name: 'slug', description: 'Business slug', example: 'my-shop' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 25,
    description: 'Limit per page (max 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of reviews',
    schema: {
      example: {
        total: 40,
        page: 1,
        limit: 25,
        reviews: [
          {
            id: 'uuid',
            type: 'video',
            status: 'approved',
            reviewerName: 'John Doe',
            rating: 5,
            submittedAt: '2025-09-16T10:12:00.000Z',
            mediaAssets: [
              { id: 'uuid', type: 'video', s3Key: 'reviews/video1.mp4' },
            ],
          },
        ],
      },
    },
  })
  async list(
    @Param('slug') slug: string,
    @Query('page') page = '1',
    @Query('limit') limit = '25',
  ) {
    const p = Number(page) || 1;
    const l = Math.min(100, Number(limit) || 25);
    return this.moderation.listAllForBusinessBySlug(slug, p, l);
  }

  // --------------------------
  // GET single review
  // --------------------------
  @Get(':slug/reviews/:id')
  @ApiOperation({ summary: 'Get single review by ID for a business (by slug)' })
  @ApiParam({ name: 'slug', description: 'Business slug', example: 'my-shop' })
  @ApiParam({
    name: 'id',
    description: 'Review ID (UUID)',
    example: 'dcd6b6bb-1234-45b3-91ae-2c8c7a61b7e0',
  })
  @ApiResponse({
    status: 200,
    description: 'Single review object',
    schema: {
      example: {
        id: 'uuid',
        type: 'text',
        status: 'pending',
        reviewerName: 'Jane Doe',
        rating: 4,
        bodyText: 'Great service!',
        submittedAt: '2025-09-16T10:12:00.000Z',
      },
    },
  })
  async get(@Param('slug') slug: string, @Param('id') id: string) {
    const biz = await this.moderation['bizService'].findBySlug(slug);
    if (!biz) throw new BadRequestException('Business not found');
    return this.moderation.getReviewForBusiness(biz.id, id);
  }

  // --------------------------
  // UPDATE status of review
  // --------------------------
  @Post(':slug/reviews/:id/status')
  @ApiOperation({ summary: 'Change review status (approve/reject/hidden)' })
  @ApiParam({ name: 'slug', description: 'Business slug', example: 'my-shop' })
  @ApiParam({
    name: 'id',
    description: 'Review ID (UUID)',
    example: 'dcd6b6bb-1234-45b3-91ae-2c8c7a61b7e0',
  })
  @ApiBody({
    description: 'Status update payload',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['approved', 'rejected', 'hidden'] },
      },
      required: ['status'],
      example: { status: 'approved' },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated review with new status',
    schema: {
      example: {
        id: 'uuid',
        status: 'approved',
        publishedAt: '2025-09-16T10:12:00.000Z',
      },
    },
  })
  async setStatus(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const biz = await this.moderation['bizService'].findBySlug(slug);
    if (!biz) throw new BadRequestException('Business not found');
    return this.moderation.setStatusForBusiness(biz.id, id, body.status);
  }
}
