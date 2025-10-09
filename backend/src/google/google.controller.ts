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
  Logger,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { BusinessService } from '../business/business.service';
import { ConnectGoogleDto } from './dto/connect-google.dto';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { RequireProfessionalPlan } from '../common/decorators/subscription.decorator';
import type { Response } from 'express';

@ApiTags('Google Integration - ProjectMVP Milestone 6')
@Controller('api/google')
export class GoogleController {
  private readonly logger = new Logger(GoogleController.name);

  constructor(
    private readonly googleService: GoogleService,
    private readonly businessService: BusinessService,
  ) {}

  // Get OAuth URL for Google connection - ProjectMVP Milestone 6
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireProfessionalPlan()
  @ApiBearerAuth()
  @Get('auth-url')
  @ApiResponse({ status: 200, description: 'Google OAuth URL generated' })
  async getAuthUrl(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const authUrl = await this.googleService.getAuthUrl(business.id);
    return { authUrl };
  }

  // Connect Google Business Profile - ProjectMVP Milestone 6
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @ApiBearerAuth()
  @RequireProfessionalPlan()
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

  // Get Google connection status - Enhanced
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @ApiBearerAuth()
  @RequireProfessionalPlan()
  @Get('status')
  @ApiResponse({ status: 200, description: 'Google connection status' })
  async getConnectionStatus(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const status = await this.googleService.getConnectionStatus(business.id);
    return {
      ...status,
      businessId: business.id,
      businessName: business.name,
    };
  }

  // Check connection progress (for polling after OAuth)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireProfessionalPlan()
  @ApiBearerAuth()
  @Get('connection-progress')
  @ApiResponse({ status: 200, description: 'Check if connection is being processed' })
  async checkConnectionProgress(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const status = await this.googleService.getConnectionStatus(business.id);
    
    return {
      isConnected: status.connected,
      isProcessing: !status.connected, // If not connected yet, assume processing
      message: status.connected 
        ? 'Google Business Profile connected successfully' 
        : 'Connection in progress...',
      connectedAt: status.connectedAt,
    };
  }

  // List Google Business Profiles - REAL DATA (ProjectMVP Milestone 6)
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireProfessionalPlan()
  @ApiBearerAuth()
  @Get('business-profiles')
  @ApiResponse({ status: 200, description: 'List available Google Business Profiles' })
  async getGoogleBusinessProfiles(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const profiles = await this.googleService.getGoogleBusinessProfiles(business.id);
    
    return {
      profiles: profiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        address: profile.address,
        reviewCount: profile.reviewCount,
        averageRating: profile.averageRating,
        locationId: profile.locationId,
      })),
    };
  }

  // Import REAL Google reviews - ProjectMVP Milestone 6
  @UseGuards(JwtAuthGuard, SubscriptionGuard  )
  @RequireProfessionalPlan()
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
      message: `Imported ${reviews.length} REAL Google reviews`,
      reviewsImported: reviews.length,
    };
  }

  // Get imported Google reviews - Multi-tenant compliant
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireProfessionalPlan()
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

  // OAuth callback handler - OPTIMIZED for speed (Production Ready)
  @Get('callback')
  @ApiResponse({ status: 200, description: 'OAuth callback processed' })
  async handleCallback(
    @Query('code') code: string, 
    @Query('state') state: string,
    @Res() res: Response
  ) {
    if (!code) {
      return res.status(400).send(`
        <html>
          <body>
            <h2>❌ Authorization Failed</h2>
            <p>Authorization code not provided</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
        </html>
      `);
    }

    if (!state) {
      return res.status(400).send(`
        <html>
          <body>
            <h2>❌ Authorization Failed</h2>
            <p>State parameter missing</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
        </html>
      `);
    }

    try {
      const businessId = state;
      
      // FAST RESPONSE: Process connection asynchronously
      setImmediate(async () => {
        try {
          await this.googleService.connectGoogleBusiness(businessId, code);
          this.logger.log(`✅ Google connection successful for business ${businessId}`);
        } catch (error) {
          this.logger.error(`❌ Google connection failed for business ${businessId}:`, error.message);
        }
      });

      // Return immediate success response
      return res.send(`
        <html>
          <head>
            <title>Google Connected - TrueTestify</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8fafc; }
              .success { color: #10b981; font-size: 24px; margin-bottom: 16px; }
              .loading { color: #3b82f6; font-size: 16px; margin-bottom: 12px; }
              .info { color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <h2 class="success">✅ Google Business Profile Connected!</h2>
            <p class="loading">Processing your connection...</p>
            <p class="info">You can close this window and return to your TrueTestify dashboard.</p>
            <script>
              // Auto-close after 2 seconds and refresh parent
              setTimeout(() => {
                if (window.opener) {
                  window.opener.location.reload();
                }
                window.close();
              }, 2000);
            </script>
          </body>
        </html>
      `);
      
    } catch (error) {
      this.logger.error('Callback error:', error);
      return res.status(500).send(`
        <html>
          <body>
            <h2>❌ Connection Error</h2>
            <p>Failed to process Google connection: ${error.message}</p>
            <script>setTimeout(() => window.close(), 5000);</script>
          </body>
        </html>
      `);
    }
  }

  // Disconnect Google Business Profile
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireProfessionalPlan()
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