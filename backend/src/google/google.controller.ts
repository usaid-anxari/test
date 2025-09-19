import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { BusinessService } from '../business/business.service';
import { ConnectGoogleDto } from './dto/connect-google.dto';

@ApiTags('Google Integration')
@Controller('api/google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private readonly businessService: BusinessService,
  ) {}

  // Milestone 6: Connect Google Business Profile
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('connect')
  @ApiBody({ type: ConnectGoogleDto })
  @ApiResponse({ status: 200, description: 'Google Business Profile connected successfully' })
  async connectGoogle(@Req() req, @Body() body: ConnectGoogleDto) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const connection = await this.googleService.connectGoogleBusiness(
      business.id,
      body.code,
      body.locationId
    );

    return {
      message: 'Google Business Profile connected successfully',
      connection: {
        id: connection.id,
        status: connection.status,
        connectedAt: connection.connectedAt,
      },
    };
  }

  // Get Google connection status
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('status')
  @ApiResponse({ status: 200, description: 'Google connection status' })
  async getConnectionStatus(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const status = await this.googleService.getConnectionStatus(business.id);
    return status;
  }

  // Import Google reviews
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('import-reviews')
  @ApiResponse({ status: 200, description: 'Google reviews imported successfully' })
  async importReviews(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const reviews = await this.googleService.importGoogleReviews(business.id);
    
    return {
      message: `Imported ${reviews.length} Google reviews`,
      reviewsImported: reviews.length,
    };
  }

  // Get imported Google reviews
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('reviews')
  @ApiResponse({ status: 200, description: 'List of imported Google reviews' })
  async getGoogleReviews(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const reviews = await this.googleService.getGoogleReviews(business.id);
    
    return {
      reviews: reviews.map(review => ({
        id: review.id,
        reviewerName: review.reviewerName,
        rating: review.rating,
        text: review.text,
        reviewedAt: review.reviewedAt,
        createdAt: review.createdAt,
      })),
    };
  }

  // OAuth callback handler
  @Get('callback')
  @ApiResponse({ status: 200, description: 'OAuth callback processed' })
  async handleCallback(@Query('code') code: string, @Query('state') state: string) {
    if (!code) {
      throw new BadRequestException('Authorization code not provided');
    }

    // In production, validate state parameter for security
    const businessId = state; // Pass businessId as state parameter
    
    const connection = await this.googleService.connectGoogleBusiness(businessId, code);
    
    // Redirect back to dashboard with success message
    return `<script>window.close(); window.opener.location.reload();</script>`;
  }

  // Disconnect Google Business Profile
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('disconnect')
  @ApiResponse({ status: 200, description: 'Google Business Profile disconnected' })
  async disconnectGoogle(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const result = await this.googleService.disconnectGoogleBusiness(business.id);
    return result;
  }
}
