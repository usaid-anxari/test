import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleConnection } from './entities/google-connection.entity';
import { GoogleReview } from './entities/google-review.entity';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {
  private readonly logger = new Logger(GoogleService.name);

  constructor(
    @InjectRepository(GoogleConnection)
    private connectionRepo: Repository<GoogleConnection>,
    @InjectRepository(GoogleReview)
    private googleReviewRepo: Repository<GoogleReview>,
    private configService: ConfigService,
  ) {}

  // Milestone 6: Connect Google Business Profile
  async connectGoogleBusiness(businessId: string, authCode: string, locationId?: string) {
    try {
      const existingConnection = await this.connectionRepo.findOne({
        where: { businessId }
      });

      if (existingConnection) {
        // Update existing connection
        existingConnection.status = 'connected';
        existingConnection.connectedAt = new Date();
        existingConnection.locationId = locationId || existingConnection.locationId;
        return await this.connectionRepo.save(existingConnection);
      } else {
        // Create new connection
        const connection = this.connectionRepo.create({
          businessId,
          googleAccountId: 'simulated-account-id',
          locationId: locationId || 'simulated-location-id',
          accessToken: 'simulated-access-token',
          refreshToken: 'simulated-refresh-token',
          status: 'connected',
          connectedAt: new Date(),
        });
        return await this.connectionRepo.save(connection);
      }
    } catch (error) {
      this.logger.error('Failed to connect Google Business', error);
      throw new BadRequestException('Failed to connect Google Business Profile');
    }
  }

  // Get Google connection status
  async getConnectionStatus(businessId: string) {
    const connection = await this.connectionRepo.findOne({
      where: { businessId }
    });
    
    return {
      connected: !!connection && connection.status === 'connected',
      connectedAt: connection?.connectedAt,
      locationId: connection?.locationId,
    };
  }

  // Import Google reviews from Google My Business API
  async importGoogleReviews(businessId: string) {
    const connection = await this.connectionRepo.findOne({
      where: { businessId, status: 'connected' }
    });

    if (!connection) {
      throw new BadRequestException('Google Business Profile not connected');
    }

    // Simulate importing Google reviews for MVP
    const simulatedReviews = [
      {
        reviewerName: 'John Smith',
        rating: 5,
        text: 'Excellent service! Highly recommend.',
        reviewedAt: new Date('2024-01-15'),
      },
      {
        reviewerName: 'Sarah Johnson',
        rating: 4,
        text: 'Great experience, will come back again.',
        reviewedAt: new Date('2024-01-10'),
      },
    ];

    const importedReviews: GoogleReview[] = [];
    for (const reviewData of simulatedReviews) {
      // Check if review already exists
      const existing = await this.googleReviewRepo.findOne({
        where: {
          businessId,
          reviewerName: reviewData.reviewerName,
          reviewedAt: reviewData.reviewedAt,
        }
      });

      if (!existing) {
        const review = this.googleReviewRepo.create({
          businessId,
          ...reviewData,
          sourceJson: { imported: true, source: 'google' },
        });
        const saved = await this.googleReviewRepo.save(review);
        importedReviews.push(saved);
      }
    }

    this.logger.log(`Imported ${importedReviews.length} Google reviews for business ${businessId}`);
    return importedReviews;
  }

  // Get Google reviews for a business
  async getGoogleReviews(businessId: string) {
    return await this.googleReviewRepo.find({
      where: { businessId },
      order: { reviewedAt: 'DESC' },
    });
  }

  // Disconnect Google Business Profile
  async disconnectGoogleBusiness(businessId: string) {
    const connection = await this.connectionRepo.findOne({
      where: { businessId }
    });

    if (connection) {
      connection.status = 'disconnected';
      await this.connectionRepo.save(connection);
    }

    return { message: 'Google Business Profile disconnected' };
  }
}
