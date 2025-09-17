import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { WidgetsService } from '../widgets/widgets.service';
import { BusinessService } from '../business/business.service';

@ApiTags('Embed')
@Controller('embed')
export class EmbedController {
  constructor(
    private readonly widgetsService: WidgetsService,
    private readonly businessService: BusinessService,
  ) {}

  // Milestone 7: Serve widget by business slug
  @Get(':slug')
  @ApiResponse({ status: 200, description: 'Widget HTML/JS content' })
  async serveWidget(
    @Param('slug') slug: string,
    @Query('style') style: string = 'grid',
    @Res() res: Response
  ) {
    const business = await this.businessService.findBySlug(slug);
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    // Get business reviews for widget
    const profileData = await this.businessService.getPublicProfileWithReviews(slug);
    
    const widgetHtml = this.generateWidgetHtml(profileData, style);
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(widgetHtml);
  }

  // Serve widget by widget ID
  @Get('widget/:widgetId')
  @ApiResponse({ status: 200, description: 'Widget by ID' })
  async serveWidgetById(
    @Param('widgetId') widgetId: string,
    @Res() res: Response
  ) {
    // This would require finding the widget and its business
    // For MVP, redirect to slug-based embed
    res.status(302).redirect('/embed/demo?style=grid');
  }

  // Generate widget HTML
  private generateWidgetHtml(profileData: any, style: string): string {
    const { business, reviews } = profileData;
    
    const widgetStyles = {
      grid: this.generateGridWidget(business, reviews),
      carousel: this.generateCarouselWidget(business, reviews),
      spotlight: this.generateSpotlightWidget(business, reviews),
      floating: this.generateFloatingWidget(business, reviews),
    };

    return widgetStyles[style] || widgetStyles.grid;
  }

  private generateGridWidget(business: any, reviews: any[]): string {
    const reviewCards = reviews.slice(0, 6).map(review => `
      <div class="tt-review-card">
        <div class="tt-rating">${'★'.repeat(review.rating || 5)}</div>
        <h4>${review.title || 'Great Review'}</h4>
        <p>${review.bodyText || 'Amazing service!'}</p>
        <small>- ${review.reviewerName || 'Customer'}</small>
      </div>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        .tt-widget { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; }
        .tt-header { text-align: center; margin-bottom: 20px; }
        .tt-reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .tt-review-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #fff; }
        .tt-rating { color: #ffa500; font-size: 18px; margin-bottom: 8px; }
        .tt-review-card h4 { margin: 0 0 8px 0; color: #333; }
        .tt-review-card p { margin: 0 0 8px 0; color: #666; line-height: 1.4; }
        .tt-review-card small { color: #999; }
      </style>
    </head>
    <body>
      <div class="tt-widget">
        <div class="tt-header">
          <h3>${business.name} Reviews</h3>
        </div>
        <div class="tt-reviews-grid">
          ${reviewCards}
        </div>
      </div>
    </body>
    </html>`;
  }

  private generateCarouselWidget(business: any, reviews: any[]): string {
    return this.generateGridWidget(business, reviews).replace('tt-reviews-grid', 'tt-reviews-carousel');
  }

  private generateSpotlightWidget(business: any, reviews: any[]): string {
    const featuredReview = reviews[0] || { title: 'Great Service', rating: 5, reviewerName: 'Customer' };
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        .tt-spotlight { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .tt-rating { color: #ffa500; font-size: 24px; margin-bottom: 10px; }
        .tt-spotlight h3 { margin: 0 0 10px 0; color: #333; }
        .tt-spotlight p { color: #666; line-height: 1.4; margin-bottom: 10px; }
        .tt-spotlight small { color: #999; }
      </style>
    </head>
    <body>
      <div class="tt-spotlight">
        <div class="tt-rating">${'★'.repeat(featuredReview.rating || 5)}</div>
        <h3>${featuredReview.title || 'Great Review'}</h3>
        <p>${featuredReview.bodyText || 'Amazing service!'}</p>
        <small>- ${featuredReview.reviewerName || 'Customer'}</small>
      </div>
    </body>
    </html>`;
  }

  private generateFloatingWidget(business: any, reviews: any[]): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        .tt-floating { position: fixed; bottom: 20px; right: 20px; width: 300px; background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 1000; }
        .tt-floating h4 { margin: 0 0 10px 0; color: #333; }
        .tt-review-mini { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
        .tt-review-mini:last-child { border-bottom: none; margin-bottom: 0; }
        .tt-rating { color: #ffa500; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="tt-floating">
        <h4>${business.name} Reviews</h4>
        ${reviews.slice(0, 3).map(review => `
          <div class="tt-review-mini">
            <div class="tt-rating">${'★'.repeat(review.rating || 5)}</div>
            <small>${review.reviewerName || 'Customer'}</small>
          </div>
        `).join('')}
      </div>
    </body>
    </html>`;
  }
}
