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
import { ConfigService } from '@nestjs/config';

@ApiTags('Embed')
@Controller()
export class EmbedController {
  constructor(
    private readonly widgetsService: WidgetsService,
    private readonly businessService: BusinessService,
    private readonly configService: ConfigService,
  ) {}

  // Serve embed.js script
  @Get('embed.js')
  @ApiResponse({ status: 200, description: 'Embed JavaScript' })
  async serveEmbedScript(@Res() res: Response) {
    const embedScript = `
(function() {
  function loadTrueTestifyWidget() {
    var scripts = document.querySelectorAll('script[data-widget-id]');
    scripts.forEach(function(script) {
      var widgetId = script.getAttribute('data-widget-id');
      var style = script.getAttribute('data-style') || 'grid';
      var targetId = 'truetestify-widget-' + widgetId;
      
      var container = document.getElementById(targetId);
      if (!container) {
        container = document.createElement('div');
        container.id = targetId;
        script.parentNode.insertBefore(container, script);
      }
      
      fetch('${this.configService.get(
        'BACKEND_URL',
      )}/embed/' + widgetId + '?style=' + style)
        .then(function(response) { return response.text(); })
        .then(function(html) {
          container.innerHTML = html;
        })
        .catch(function(error) {
          container.innerHTML = '<p>Unable to load reviews</p>';
        });
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTrueTestifyWidget);
  } else {
    loadTrueTestifyWidget();
  }
})();
`;

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(embedScript);
  }

  // Serve widget by slug or widget ID
  @Get('embed/:slugOrId')
  @ApiResponse({ status: 200, description: 'Widget HTML/JS content' })
  async serveWidget(
    @Param('slugOrId') slugOrId: string,
    @Query('style') style: string = 'grid',
    @Res() res: Response,
  ) {
    try {
      // Check if it's a UUID (widget ID) or slug
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          slugOrId,
        );

      let business, profileData;

      if (isUUID) {
        // Handle as widget ID
        const widget = await this.widgetsService.findById(slugOrId);
        if (!widget) {
          return res.status(404).send('<p>Widget not found</p>');
        }

        business = await this.businessService.findById(widget.businessId);
        if (!business) {
          return res.status(404).send('<p>Business not found</p>');
        }

        profileData = await this.businessService.getPublicProfileWithReviews(
          business.slug,
        );
        style = widget.style; // Use widget's style
      } else {
        // Handle as business slug
        business = await this.businessService.findBySlug(slugOrId);
        if (!business) {
          return res.status(404).send('<p>Business not found</p>');
        }

        profileData = await this.businessService.getPublicProfileWithReviews(
          slugOrId,
        );
      }

      const widgetHtml = this.generateWidgetHtml(profileData, style);

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(widgetHtml);
    } catch (error) {
      res.status(500).send('<p>Error loading widget</p>');
    }
  }

  // Serve widget by widget ID
  @Get('widget/:widgetId')
  @ApiResponse({ status: 200, description: 'Widget by ID' })
  async serveWidgetById(
    @Param('widgetId') widgetId: string,
    @Res() res: Response,
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
    const reviewCards = reviews
      .slice(0, 6)
      .map((review) => {
        let mediaContent = '';

        // Handle different review types
        if (
          review.type === 'video' &&
          review.media &&
          review.media.length > 0
        ) {
          const videoAsset = review.media[0];

          mediaContent = `<video class="tt-media" controls><source src="${this.configService.get(
            'AWS_DOMAIN_URL',
          )}/${
            videoAsset.s3Key
          }" type="video/mp4">Your browser does not support video.</video>`;
        } else if (
          review.type === 'audio' &&
          review.media &&
          review.media.length > 0
        ) {
          const audioAsset = review.media[0];

          mediaContent = `<audio class="tt-media" controls><source src="${this.configService.get(
            'AWS_DOMAIN_URL',
          )}/${
            audioAsset.s3Key
          }" type="audio/mpeg">Your browser does not support audio.</audio>`;
        }

        // Add type indicator
        const typeIndicator =
          review.type === 'google'
            ? '<span class="tt-type-badge tt-google">Google Review</span>'
            : `<span class="tt-type-badge tt-${review.type}">${
                review.type.charAt(0).toUpperCase() + review.type.slice(1)
              }</span>`;

        return `
        <div class="tt-review-card tt-${review.type}">
          ${typeIndicator}
          <div class="tt-rating">${'★'.repeat(review.rating || 5)}${'☆'.repeat(
          5 - (review.rating || 5),
        )}</div>
          <h4>${review.title || 'Great Review'}</h4>
          ${mediaContent}
          ${review.bodyText ? `<p>${review.bodyText}</p>` : ''}
          <small>- ${review.reviewerName || 'Customer'}</small>
          ${
            review.publishedAt
              ? `<div class="tt-date">${new Date(
                  review.publishedAt,
                ).toLocaleDateString()}</div>`
              : ''
          }
        </div>
      `;
      })
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        .tt-widget { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .tt-header { text-align: center; margin-bottom: 20px; }
        .tt-reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .tt-review-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #fff; position: relative; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .tt-rating { color: #ffa500; font-size: 18px; margin-bottom: 8px; }
        .tt-review-card h4 { margin: 0 0 8px 0; color: #333; font-size: 16px; }
        .tt-review-card p { margin: 0 0 8px 0; color: #666; line-height: 1.4; }
        .tt-review-card small { color: #999; font-weight: bold; }
        .tt-date { font-size: 12px; color: #aaa; margin-top: 8px; }
        .tt-media { width: 100%; max-height: 200px; border-radius: 4px; margin: 8px 0; }
        .tt-type-badge { position: absolute; top: 8px; right: 8px; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .tt-video { background: #ff6b35; color: white; }
        .tt-audio { background: #8b5cf6; color: white; }
        .tt-text { background: #10b981; color: white; }
        .tt-google { background: #4285f4; color: white; }
        .tt-review-card.tt-video { border-left: 4px solid #ff6b35; }
        .tt-review-card.tt-audio { border-left: 4px solid #8b5cf6; }
        .tt-review-card.tt-text { border-left: 4px solid #10b981; }
        .tt-review-card.tt-google { border-left: 4px solid #4285f4; }
      </style>
    </head>
    <body>
      <div class="tt-widget">
        <div class="tt-header">
          <h3>${business.name} Reviews</h3>
          <p style="color: #666; margin: 0;">Trusted by our customers</p>
        </div>
        <div class="tt-reviews-grid">
          ${reviewCards}
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          Powered by <a href="https://truetestify.com" target="_blank" style="color: #3b82f6; text-decoration: none;">TrueTestify</a>
        </div>
      </div>
    </body>
    </html>`;
  }

  private generateCarouselWidget(business: any, reviews: any[]): string {
    const reviewCards = reviews
      .slice(0, 8)
      .map((review, index) => {
        let mediaContent = '';

        if (
          review.type === 'video' &&
          review.media &&
          review.media.length > 0
        ) {
          const videoAsset = review.media[0];
          mediaContent = `<video class="tt-carousel-media" controls><source src="${this.configService.get(
            'AWS_DOMAIN_URL',
          )}/${
            videoAsset.s3Key
          }" type="video/mp4">Your browser does not support video.</video>`;
        } else if (
          review.type === 'audio' &&
          review.media &&
          review.media.length > 0
        ) {
          const audioAsset = review.media[0];
          mediaContent = `<audio class="tt-carousel-media" controls><source src="${this.configService.get(
            'AWS_DOMAIN_URL',
          )}/${
            audioAsset.s3Key
          }" type="audio/mpeg">Your browser does not support audio.</audio>`;
        }

        const typeIndicator =
          review.type === 'google'
            ? '<span class="tt-type-badge tt-google">Google</span>'
            : `<span class="tt-type-badge tt-${review.type}">${
                review.type.charAt(0).toUpperCase() + review.type.slice(1)
              }</span>`;

        return `
        <div class="tt-carousel-slide tt-${review.type}" data-slide="${index}">
          ${typeIndicator}
          <div class="tt-rating">${'★'.repeat(review.rating || 5)}${'☆'.repeat(
          5 - (review.rating || 5),
        )}</div>
          <h4>${review.title || 'Great Review'}</h4>
          ${mediaContent}
          ${review.bodyText ? `<p>${review.bodyText}</p>` : ''}
          <small>- ${review.reviewerName || 'Customer'}</small>
        </div>
      `;
      })
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        .tt-widget { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .tt-header { text-align: center; margin-bottom: 20px; }
        .tt-carousel-container { position: relative; overflow: hidden; border-radius: 12px; }
        .tt-carousel { display: flex; transition: transform 0.3s ease; }
        .tt-carousel-slide { min-width: 100%; padding: 20px; background: #fff; border: 1px solid #ddd; position: relative; }
        .tt-rating { color: #ffa500; font-size: 18px; margin-bottom: 8px; }
        .tt-carousel-slide h4 { margin: 0 0 8px 0; color: #333; }
        .tt-carousel-slide p { margin: 0 0 8px 0; color: #666; line-height: 1.4; }
        .tt-carousel-slide small { color: #999; font-weight: bold; }
        .tt-carousel-media { width: 100%; max-height: 200px; border-radius: 8px; margin: 10px 0; }
        .tt-type-badge { position: absolute; top: 10px; right: 10px; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .tt-video { background: #ff6b35; color: white; }
        .tt-audio { background: #8b5cf6; color: white; }
        .tt-text { background: #10b981; color: white; }
        .tt-google { background: #4285f4; color: white; }
        .tt-carousel-nav { text-align: center; margin-top: 15px; }
        .tt-nav-btn { background: #3b82f6; color: white; border: none; padding: 8px 16px; margin: 0 5px; border-radius: 4px; cursor: pointer; }
        .tt-nav-btn:hover { background: #2563eb; }
        .tt-nav-btn:disabled { background: #ccc; cursor: not-allowed; }
      </style>
    </head>
    <body>
      <div class="tt-widget">
        <div class="tt-header">
          <h3>${business.name} Reviews</h3>
          <p style="color: #666; margin: 0;">Swipe to see more reviews</p>
        </div>
        <div class="tt-carousel-container">
          <div class="tt-carousel" id="ttCarousel">
            ${reviewCards}
          </div>
        </div>
        <div class="tt-carousel-nav">
          <button class="tt-nav-btn" onclick="prevSlide()" id="prevBtn">‹ Previous</button>
          <button class="tt-nav-btn" onclick="nextSlide()" id="nextBtn">Next ›</button>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          Powered by <a href="https://truetestify.com" target="_blank" style="color: #3b82f6; text-decoration: none;">TrueTestify</a>
        </div>
      </div>
      <script>
        let currentSlide = 0;
        const totalSlides = ${reviews.slice(0, 8).length};
        
        function updateCarousel() {
          const carousel = document.getElementById('ttCarousel');
          carousel.style.transform = \`translateX(-\${currentSlide * 100}%)\`;
          
          document.getElementById('prevBtn').disabled = currentSlide === 0;
          document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
        }
        
        function nextSlide() {
          if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateCarousel();
          }
        }
        
        function prevSlide() {
          if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
          }
        }
        
        updateCarousel();
      </script>
    </body>
    </html>`;
  }

  private generateSpotlightWidget(business: any, reviews: any[]): string {
    const featuredReview = reviews[0] || {
      title: 'Great Service',
      rating: 5,
      reviewerName: 'Customer',
      type: 'text',
    };

    let mediaContent = '';
    if (
      featuredReview.type === 'video' &&
      featuredReview.media &&
      featuredReview.media.length > 0
    ) {
      const videoAsset = featuredReview.media[0];
      mediaContent = `<video class="tt-spotlight-media" controls><source src="${this.configService.get(
        'AWS_DOMAIN_URL',
      )}/${
        videoAsset.s3Key
      }" type="video/mp4">Your browser does not support video.</video>`;
    } else if (
      featuredReview.type === 'audio' &&
      featuredReview.media &&
      featuredReview.media.length > 0
    ) {
      const audioAsset = featuredReview.media[0];
      mediaContent = `<audio class="tt-spotlight-media" controls><source src="${this.configService.get(
        'AWS_DOMAIN_URL',
      )}/${
        audioAsset.s3Key
      }" type="audio/mpeg">Your browser does not support audio.</audio>`;
    }

    const typeIndicator =
      featuredReview.type === 'google'
        ? '<span class="tt-type-badge tt-google">Google Review</span>'
        : `<span class="tt-type-badge tt-${featuredReview.type}">${
            featuredReview.type.charAt(0).toUpperCase() +
            featuredReview.type.slice(1)
          }</span>`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        .tt-spotlight { font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; text-align: center; padding: 30px; border: 1px solid #ddd; border-radius: 12px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); position: relative; }
        .tt-rating { color: #ffa500; font-size: 28px; margin-bottom: 15px; }
        .tt-spotlight h3 { margin: 0 0 15px 0; color: #333; font-size: 20px; }
        .tt-spotlight p { color: #666; line-height: 1.5; margin-bottom: 15px; font-size: 16px; }
        .tt-spotlight small { color: #999; font-weight: bold; }
        .tt-spotlight-media { width: 100%; max-height: 250px; border-radius: 8px; margin: 15px 0; }
        .tt-type-badge { position: absolute; top: 15px; right: 15px; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .tt-video { background: #ff6b35; color: white; }
        .tt-audio { background: #8b5cf6; color: white; }
        .tt-text { background: #10b981; color: white; }
        .tt-google { background: #4285f4; color: white; }
        .tt-date { font-size: 12px; color: #aaa; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="tt-spotlight">
        ${typeIndicator}
        <div class="tt-rating">${'★'.repeat(
          featuredReview.rating || 5,
        )}${'☆'.repeat(5 - (featuredReview.rating || 5))}</div>
        <h3>${featuredReview.title || 'Great Review'}</h3>
        ${mediaContent}
        ${featuredReview.bodyText ? `<p>${featuredReview.bodyText}</p>` : ''}
        <small>- ${featuredReview.reviewerName || 'Customer'}</small>
        ${
          featuredReview.publishedAt
            ? `<div class="tt-date">${new Date(
                featuredReview.publishedAt,
              ).toLocaleDateString()}</div>`
            : ''
        }
        <div style="margin-top: 20px; font-size: 12px; color: #999;">
          Powered by <a href="https://truetestify.com" target="_blank" style="color: #3b82f6; text-decoration: none;">TrueTestify</a>
        </div>
      </div>
    </body>
    </html>`;
  }

  private generateFloatingWidget(business: any, reviews: any[]): string {
    const miniReviews = reviews
      .slice(0, 3)
      .map((review) => {
        const typeIcon =
          {
            video: '🎥',
            audio: '🎧',
            text: '📝',
            google: 'G',
          }[review.type] || '★';

        return `
        <div class="tt-review-mini tt-${review.type}">
          <div class="tt-mini-header">
            <span class="tt-type-icon">${typeIcon}</span>
            <div class="tt-rating">${'★'.repeat(review.rating || 5)}</div>
          </div>
          <div class="tt-mini-title">${(
            review.title || 'Great Review'
          ).substring(0, 30)}${
          (review.title || '').length > 30 ? '...' : ''
        }</div>
          <small>${review.reviewerName || 'Customer'}</small>
        </div>
      `;
      })
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        .tt-floating { position: fixed; bottom: 20px; right: 20px; width: 320px; background: #fff; border: 1px solid #ddd; border-radius: 12px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 1000; transition: transform 0.3s ease; }
        .tt-floating:hover { transform: translateY(-2px); }
        .tt-floating h4 { margin: 0 0 15px 0; color: #333; font-size: 16px; text-align: center; }
        .tt-review-mini { margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #ddd; }
        .tt-review-mini:last-child { margin-bottom: 0; }
        .tt-review-mini.tt-video { border-left-color: #ff6b35; }
        .tt-review-mini.tt-audio { border-left-color: #8b5cf6; }
        .tt-review-mini.tt-text { border-left-color: #10b981; }
        .tt-review-mini.tt-google { border-left-color: #4285f4; }
        .tt-mini-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .tt-type-icon { font-size: 14px; }
        .tt-rating { color: #ffa500; font-size: 12px; }
        .tt-mini-title { font-size: 13px; font-weight: 500; color: #333; margin-bottom: 3px; }
        .tt-review-mini small { color: #666; font-size: 11px; }
        .tt-powered { text-align: center; margin-top: 15px; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        .tt-powered a { color: #3b82f6; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="tt-floating">
        <h4>★ ${business.name} Reviews</h4>
        ${miniReviews}
        <div class="tt-powered">
          Powered by <a href="https://truetestify.com" target="_blank">TrueTestify</a>
        </div>
      </div>
    </body>
    </html>`;
  }
}
