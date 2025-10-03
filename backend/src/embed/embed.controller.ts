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

      let business,
        profileData,
        widget: any = null;

      if (isUUID) {
        // Handle as widget ID
        widget = await this.widgetsService.findById(slugOrId);

        if (!widget) {
          return res.status(404).send('<p>Widget not found</p>');
        }

        // Check if widget is active
        if (!widget.isActive) {
          return res.status(404).send('<p>Widget is not active</p>');
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

      const widgetHtml = this.generateWidgetHtml(profileData, style, widget);

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
  private generateWidgetHtml(
    profileData: any,
    style: string,
    widget?: any,
  ): string {
    const { business, reviews } = profileData;
    const settingsJson = widget?.settingsJson || {};

    const widgetStyles = {
      grid: this.generateGridWidget(business, reviews, settingsJson, widget),
      carousel: this.generateCarouselWidget(business, reviews, settingsJson, widget),
      spotlight: this.generateSpotlightWidget(business, reviews, settingsJson, widget),
      floating: this.generateFloatingWidget(business, reviews, settingsJson, widget),
    };

    return widgetStyles[style] || widgetStyles.grid;
  }

  private generateGridWidget(
    business: any,
    reviews: any[],
    settingsJson: any = {},
    widget?: any,
  ): string {
    const isDark = settingsJson.theme === 'dark';
    const autoplay = settingsJson.autoplay || false;
    const primary = settingsJson.primary || '#3b82f6';
    const secondary = settingsJson.secondary || '#10b981';
    const background =
      settingsJson.background || (isDark ? '#1f2937' : '#ffffff');

    if (reviews.length === 0) {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${business.name} Reviews</title>
        <style>
          .tt-widget { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; background: ${background}; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
          .tt-no-reviews { text-align: center; padding: 60px 30px; border: 2px dashed ${primary}; border-radius: 20px; background: linear-gradient(135deg, ${primary}10, ${secondary}10); }
          .tt-no-reviews h3 { color: ${primary}; margin-bottom: 12px; font-size: 24px; font-weight: 700; }
          .tt-no-reviews p { color: ${
            isDark ? '#000000' : '#000000'
          }; margin-bottom: 20px; font-size: 16px; }
          .tt-review-btn { background: linear-gradient(135deg, ${primary}, ${secondary}); color: white; padding: 14px 28px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.3s ease; box-shadow: 0 4px 16px ${primary}40; }
          .tt-review-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${primary}60; }
        </style>
      </head>
      <body>
        <div class="tt-widget">
          <div class="tt-no-reviews">
            <h3>No Reviews Yet</h3>
            <p>Be the first to share your experience!</p>
            <a href="${this.configService.get("FRONTEND_URL")}/record/${business.slug}" class="tt-review-btn" target="_blank">Submit Review</a>
          </div>
        </div>
      </body>
      </html>`;
    }

    const reviewCards = reviews
      .slice(0, 6)
      .map((review) => {
        let mediaContent = '';

        if (review.type === 'video' && review.media && review.media.length > 0) {
          const videoAsset = review.media[0];
          mediaContent = `
            <div class="tt-video-container">
              <video class="tt-video-player" controls ${autoplay ? 'autoplay muted' : ''}>
                <source src="${this.configService.get('AWS_DOMAIN_URL')}/${videoAsset.s3Key}" type="video/mp4">
                Your browser does not support video.
              </video>
            </div>
          `;
        } else if (review.type === 'audio' && review.media && review.media.length > 0) {
          const audioAsset = review.media[0];
          mediaContent = `
            <div class="tt-audio-container">
              <div class="tt-audio-visual">
                <div class="tt-audio-icon">🎵</div>
                <div class="tt-audio-waves">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
              <audio class="tt-audio-player" controls ${autoplay ? 'autoplay' : ''}>
                <source src="${this.configService.get('AWS_DOMAIN_URL')}/${audioAsset.s3Key}" type="audio/mpeg">
                Your browser does not support audio.
              </audio>
            </div>
          `;
        } else if (review.type === 'text') {
          mediaContent = `
            <div class="tt-text-highlight">
              <div class="tt-quote-icon">💬</div>
              ${review.bodyText ? `<p>${review.bodyText}</p>` : ''}
            </div>
          `;
        }

        const typeColors = {
          video: primary,
          audio: secondary,
          text: '#10b981',
          google: '#4285f4',
        };

        const typeIndicator =
          review.type === 'google'
            ? '<span class="tt-type-badge tt-google">Google</span>'
            : `<span class="tt-type-badge tt-${review.type}">${
                review.type.charAt(0).toUpperCase() + review.type.slice(1)
              }</span>`;

        return `
        <div class="tt-review-card tt-${
          review.type
        }" style="border-left: 4px solid ${typeColors[review.type]}">
          ${typeIndicator}
          <div class="tt-rating">${'★'.repeat(review.rating || 5)}${'☆'.repeat(
          5 - (review.rating || 5),
        )}</div>
          <h4>${review.title || 'Great Review'}</h4>
          ${mediaContent}

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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 10px; background: linear-gradient(135deg, ${primary}08, ${secondary}08, ${primary}05); min-height: 500px; font-family: 'Inter', sans-serif; }
        .tt-widget { max-width: 1200px; margin: 0 auto; padding: 24px; background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'}; border-radius: 24px; box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.2), 0 0 0 1px ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}; backdrop-filter: blur(16px); position: relative; overflow: hidden; }
        .tt-widget::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, ${primary}03, transparent, ${secondary}03); pointer-events: none; }
        .tt-header { text-align: center; margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, ${primary}15, ${secondary}15); border-radius: 16px; position: relative; overflow: hidden; backdrop-filter: blur(10px); }
        .tt-header::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: shimmer 3s infinite; }
        .tt-header h3 { margin: 0 0 8px 0; background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; position: relative; z-index: 1; }
        .tt-header p { color: ${isDark ? '#cbd5e1' : '#64748b'}; margin: 0; font-size: 16px; font-weight: 500; position: relative; z-index: 1; }
        .tt-reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; position: relative; z-index: 1; }
        .tt-review-card { background: ${isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)'}; padding: 15px; border-radius: 24px; box-shadow: 0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}; position: relative; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(12px); overflow: hidden; }
        .tt-review-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${primary}, ${secondary}); }
        .tt-review-card:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px ${primary}20; }
        .tt-rating { color: #fbbf24; font-size: 28px; margin-bottom: 20px; text-shadow: 0 2px 8px rgba(251, 191, 36, 0.3); filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4)); }
        .tt-review-card h4 { margin: 0 0 20px 0; color: ${isDark ? '#f8fafc' : '#0f172a'}; font-size: 24px; font-weight: 700; line-height: 1.3; }
        .tt-review-card p { margin: 0 0 5px 0; color: ${isDark ? '#ffffff' : '#475569'}; line-height: 1.7; font-size: 16px; }
        .tt-review-card small { background: #ffffff; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; font-size: 15px; }
        .tt-date { font-size: 13px; color: ${isDark ? '#94a3b8' : '#94a3b8'}; margin-top: 16px; opacity: 5.8; }
        .tt-video-container { position: relative; width: 100%; margin: 24px 0; border-radius: 24px; overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.25); }
        .tt-video-player { width: 100%; height: 320px; object-fit: cover; display: block; }
        .tt-audio-container { background: linear-gradient(120deg, ${secondary}55, ${primary}65); border-radius: 20px; padding: 24px; margin: 24px 0; border: 2px solid ${secondary}30; }
        .tt-audio-visual { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tt-audio-icon { font-size: 32px; }
        .tt-audio-waves { display: flex; gap: 4px; align-items: center; }
        .tt-audio-waves span { width: 4px; height: 20px; background: ${secondary}; border-radius: 2px; animation: audioWave 1.5s infinite ease-in-out; }
        .tt-audio-waves span:nth-child(2) { animation-delay: 0.1s; height: 30px; }
        .tt-audio-waves span:nth-child(3) { animation-delay: 0.2s; height: 25px; }
        .tt-audio-waves span:nth-child(4) { animation-delay: 0.3s; height: 35px; }
        .tt-audio-waves span:nth-child(5) { animation-delay: 0.4s; height: 20px; }
        .tt-audio-player { width: 100%; height: 40px; }
        
        .tt-text-highlight { position: relative; background: linear-gradient(170deg, ${primary}50, ${secondary}60); border-radius: 16px; padding: 35px; margin: 20px 0; border-left: 4px solid ${primary}; }
        .tt-quote-icon { position: absolute; top: 5px; left: 10px; font-size: 24px; padding: 7px; border-radius: 50%; }
        .tt-type-badge { position: absolute; top: 15px; right: 5px; padding: 10px 18px; border-radius: 30px; font-size: 12px; font-weight: 800; text-transform: uppercase; color: white; backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .tt-video { background: linear-gradient(135deg, ${primary}, ${primary}cc); }
        .tt-audio { background: linear-gradient(135deg, ${secondary}, ${secondary}cc); }
        .tt-text { background: linear-gradient(135deg, ${secondary}, ${secondary}cc); }
        .tt-google { background: linear-gradient(135deg, #4285f4, #34a853); }
        .tt-powered { text-align: center; margin-top: 56px; padding: 28px; background: ${isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)'}; border-radius: 20px; backdrop-filter: blur(12px); position: relative; z-index: 1; }
        .tt-powered a { background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-decoration: none; font-weight: 800; font-size: 14px; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes audioWave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
      </style>
    </head>
    <body>
      <script>
        function trackEvent(eventType, action) {
          fetch('${this.configService.get('BACKEND_URL')}/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId: '${business.id}',
              widgetId: '${widget?.id || ''}',
              eventType: eventType,
              eventData: { action: action }
            })
          }).catch(() => {});
        }
        // Track widget view on load
        trackEvent('widget_view', 'load');
        
        // Add click tracking to all clickable elements
        document.addEventListener('click', function(e) {
          if (e.target.closest('.tt-review-card')) {
            trackEvent('widget_click', 'review_card');
          }
          if (e.target.closest('.tt-powered a')) {
            trackEvent('widget_click', 'powered_by');
          }
        });
      </script>
      <div class="tt-widget">
        <div class="tt-header">
          <h3>${business.name} Reviews</h3>
          <p>Trusted by our customers worldwide</p>
        </div>
        <div class="tt-reviews-grid">
          ${reviewCards}
        </div>
        <div class="tt-powered">
          Powered by <a href="https://truetestify.com" target="_blank">TrueTestify</a>
        </div>
      </div>
    </body>
    </html>`;
  }

  private generateCarouselWidget(
    business: any,
    reviews: any[],
    settingsJson: any = {},
    widget?: any,
  ): string {
    const isDark = settingsJson.theme === 'dark';
    const autoplay = settingsJson.autoplay || false;
    const primary = settingsJson.primary || '#3b82f6';
    const secondary = settingsJson.secondary || '#10b981';
    const background =
      settingsJson.background || (isDark ? '#1f2937' : '#ffffff');

    if (reviews.length === 0) {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${business.name} Reviews</title>
        <style>
          .tt-widget { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; background: ${background}; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
          .tt-no-reviews { text-align: center; padding: 60px 30px; border: 2px dashed ${primary}; border-radius: 20px; background: linear-gradient(135deg, ${primary}10, ${secondary}10); }
          .tt-no-reviews h3 { color: ${primary}; margin-bottom: 12px; font-size: 24px; font-weight: 700; }
          .tt-no-reviews p { color: ${
            isDark ? '#000000' : '#000000'
          }; margin-bottom: 20px; font-size: 16px; }
          .tt-review-btn { background: linear-gradient(135deg, ${primary}, ${secondary}); color: white; padding: 14px 28px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.3s ease; box-shadow: 0 4px 16px ${primary}40; }
          .tt-review-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${primary}60; }
        </style>
      </head>
      <body>
        <div class="tt-widget">
          <div class="tt-no-reviews">
            <h3>No Reviews Yet</h3>
            <p>Be the first to share your experience!</p>
            <a href="${this.configService.get("FRONTEND_URL")}/record/${business.slug}" class="tt-review-btn" target="_blank">Submit Review</a>
          </div>
        </div>
      </body>
      </html>`;
    }

    const reviewCards = reviews
      .slice(0, 8)
      .map((review, index) => {
        let mediaContent = '';

        if (review.type === 'video' && review.media && review.media.length > 0) {
          const videoAsset = review.media[0];
          mediaContent = `
            <div class="tt-video-container">
              <video class="tt-video-player" controls ${autoplay ? 'autoplay muted' : ''}>
                <source src="${this.configService.get('AWS_DOMAIN_URL')}/${videoAsset.s3Key}" type="video/mp4">
                Your browser does not support video.
              </video>
            </div>
          `;
        } else if (review.type === 'audio' && review.media && review.media.length > 0) {
          const audioAsset = review.media[0];
          mediaContent = `
            <div class="tt-audio-container">
              <div class="tt-audio-visual">
                <div class="tt-audio-icon">🎵</div>
                <div class="tt-audio-waves">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
              <audio class="tt-audio-player" controls ${autoplay ? 'autoplay' : ''}>
                <source src="${this.configService.get('AWS_DOMAIN_URL')}/${audioAsset.s3Key}" type="audio/mpeg">
                Your browser does not support audio.
              </audio>
            </div>
          `;
        } else if (review.type === 'text') {
          mediaContent = `
            <div class="tt-text-highlight">
              ${review.bodyText ? `<p>${review.bodyText}</p>` : ''}
            </div>
          `;
        }

        const typeColors = {
          video: primary,
          audio: secondary,
          text: '#10b981',
          google: '#4285f4',
        };

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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 20px; background: linear-gradient(135deg, ${primary}08, ${secondary}08, ${primary}05); min-height: 100vh; font-family: 'Inter', sans-serif; }
        .tt-widget { max-width: 1200px; margin: 0 auto; padding: 48px; background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'}; border-radius: 32px; box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}; backdrop-filter: blur(24px); position: relative; overflow: hidden; }
        .tt-widget::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, ${primary}03, transparent, ${secondary}03); pointer-events: none; }
        .tt-header { text-align: center; margin-bottom: 56px; padding: 40px; background: linear-gradient(135deg, ${primary}15, ${secondary}15); border-radius: 24px; position: relative; overflow: hidden; backdrop-filter: blur(10px); }
        .tt-header::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); animation: shimmer 3s infinite; }
        .tt-header h3 { margin: 0 0 16px 0; background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 42px; font-weight: 900; letter-spacing: -0.025em; position: relative; z-index: 1; }
        .tt-header p { color: ${isDark ? '#cbd5e1' : '#64748b'}; margin: 0; font-size: 20px; font-weight: 500; position: relative; z-index: 1; }
        .tt-carousel-container { position: relative; overflow: hidden; border-radius: 32px; box-shadow: 0 24px 64px rgba(0,0,0,0.2); }
        .tt-carousel { display: flex; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .tt-carousel-slide { min-width: 100%; padding: 48px; background: ${isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)'}; position: relative; text-align: center; backdrop-filter: blur(12px); }
        .tt-rating { color: #fbbf24; font-size: 32px; margin-bottom: 24px; text-shadow: 0 2px 8px rgba(251, 191, 36, 0.3); filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4)); }
        .tt-carousel-slide h4 { margin: 0 0 24px 0; color: ${isDark ? '#f8fafc' : '#0f172a'}; font-size: 32px; font-weight: 800; line-height: 1.2; }
        .tt-carousel-slide p { margin: 0 0 28px 0; color: ${isDark ? '#cbd5e1' : '#475569'}; line-height: 1.7; font-size: 18px; max-width: 700px; margin-left: auto; margin-right: auto; }
        .tt-carousel-slide small { background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; font-size: 16px; }
        .tt-video-container { position: relative; width: 100%; max-width: 600px; margin: 32px auto; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .tt-video-player { width: 100%; height: 250px; object-fit: cover; display: block; }
        .tt-audio-container { background: linear-gradient(135deg, ${secondary}15, ${primary}15); border-radius: 24px; padding: 32px; margin: 32px auto; max-width: 500px; border: 2px solid ${secondary}30; }
        .tt-audio-visual { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px; }
        .tt-audio-icon { font-size: 40px; }
        .tt-audio-waves { display: flex; gap: 6px; align-items: center; }
        .tt-audio-waves span { width: 6px; height: 24px; background: ${secondary}; border-radius: 3px; animation: audioWave 1.5s infinite ease-in-out; }
        .tt-audio-waves span:nth-child(2) { animation-delay: 0.1s; height: 36px; }
        .tt-audio-waves span:nth-child(3) { animation-delay: 0.2s; height: 30px; }
        .tt-audio-waves span:nth-child(4) { animation-delay: 0.3s; height: 42px; }
        .tt-audio-waves span:nth-child(5) { animation-delay: 0.4s; height: 24px; }
        .tt-audio-player { width: 100%; height: 48px; }
        .tt-text-highlight { position: relative; background: linear-gradient(135deg, ${primary}15, ${secondary}15); border-radius: 20px; padding: 35px; margin: 32px auto; max-width: 600px; border-left: 6px solid ${primary}; }
        .tt-quote-icon { position: absolute; top: 5px; left: 24px; font-size: 32px; background: ${isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'}; padding: 10px; border-radius: 50%; backdrop-filter: blur(10px); }
        .tt-type-badge { position: absolute; top: 24px; right: 24px; padding: 12px 20px; border-radius: 30px; font-size: 14px; font-weight: 800; text-transform: uppercase; color: white; backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .tt-video { background: linear-gradient(135deg, ${primary}, ${primary}cc); }
        .tt-audio { background: linear-gradient(135deg, ${secondary}, ${secondary}cc); }
        .tt-text { background: linear-gradient(135deg, ${secondary}, ${secondary}cc); }
        .tt-google { background: linear-gradient(135deg, #4285f4, #34a853); }
        .tt-carousel-nav { text-align: center; margin-top: 40px; display: flex; justify-content: center; gap: 24px; position: relative; z-index: 1; }
        .tt-nav-btn { background: linear-gradient(135deg, ${primary}, ${secondary}); color: white; border: none; padding: 16px 32px; border-radius: 16px; cursor: pointer; font-weight: 700; transition: all 0.4s ease; box-shadow: 0 8px 32px ${primary}40; font-size: 16px; }
        .tt-nav-btn:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 16px 48px ${primary}60; }
        .tt-nav-btn:disabled { background: ${isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'}; cursor: not-allowed; transform: none; box-shadow: none; }
        .tt-powered { text-align: center; margin-top: 56px; padding: 28px; background: ${isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(248, 250, 252, 0.8)'}; border-radius: 20px; backdrop-filter: blur(12px); position: relative; z-index: 1; }
        .tt-powered a { background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-decoration: none; font-weight: 800; font-size: 14px; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes audioWave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
      </style>
    </head>
    <body>
      <div class="tt-widget">
        <div class="tt-header">
          <h3>${business.name} Reviews</h3>
          <p>Swipe to see more reviews</p>
        </div>
        <div class="tt-carousel-container">
          <div class="tt-carousel" id="ttCarousel">
            ${reviewCards}
          </div>
        </div>
        <div class="tt-carousel-nav">
          <button class="tt-nav-btn" id="prevBtn">‹ Previous</button>
          <button class="tt-nav-btn" id="nextBtn">Next ›</button>
        </div>
        <div class="tt-powered">
          Powered by <a href="https://truetestify.com" target="_blank">TrueTestify</a>
        </div>
      </div>
      <script>
        function trackEvent(eventType, action) {
          fetch('${this.configService.get('BACKEND_URL')}/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId: '${business.id}',
              widgetId: null,
              eventType: eventType,
              eventData: { action: action }
            })
          }).catch(() => {});
        }
        trackEvent('widget_view', 'load');
        
        (function() {
          var currentSlide = 0;
          var totalSlides = ${reviews.slice(0, 8).length};
          
          function updateCarousel() {
            var carousel = document.getElementById('ttCarousel');
            if (carousel) {
              carousel.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
            }
            
            var prevBtn = document.getElementById('prevBtn');
            var nextBtn = document.getElementById('nextBtn');
            if (prevBtn) prevBtn.disabled = currentSlide === 0;
            if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
          }
          
          function ttNextSlide() {
            if (currentSlide < totalSlides - 1) {
              currentSlide++;
              updateCarousel();
            }
          }
          
          function ttPrevSlide() {
            if (currentSlide > 0) {
              currentSlide--;
              updateCarousel();
            }
          }
          
          setTimeout(function() {
            var nextBtn = document.getElementById('nextBtn');
            var prevBtn = document.getElementById('prevBtn');
            if (nextBtn) {
              nextBtn.addEventListener('click', function() {
                trackEvent('widget_click', 'next_button');
                ttNextSlide();
              });
            }
            if (prevBtn) {
              prevBtn.addEventListener('click', function() {
                trackEvent('widget_click', 'prev_button');
                ttPrevSlide();
              });
            }
            updateCarousel();
          }, 100);
        })();
      </script>
    </body>
    </html>`;
  }

  private generateSpotlightWidget(
    business: any,
    reviews: any[],
    settingsJson: any = {},
    widget?: any,
  ): string {
    const isDark = settingsJson.theme === 'dark';
    const autoplay = settingsJson.autoplay || false;
    const primary = settingsJson.primary || '#3b82f6';
    const secondary = settingsJson.secondary || '#10b981';
    const background =
      settingsJson.background || (isDark ? '#1f2937' : '#ffffff');

    if (reviews.length === 0) {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${business.name} Reviews</title>
        <style>
          .tt-widget { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 450px; margin: 0 auto; padding: 24px; background: ${background}; border-radius: 24px; box-shadow: 0 12px 48px rgba(0,0,0,0.15); }
          .tt-no-reviews { text-align: center; padding: 60px 30px; border: 2px dashed ${primary}; border-radius: 20px; background: linear-gradient(135deg, ${primary}10, ${secondary}10); }
          .tt-no-reviews h3 { color: ${primary}; margin-bottom: 12px; font-size: 24px; font-weight: 700; }
          .tt-no-reviews p { color: ${
            isDark ? '#000000' : '#000000'
          }; margin-bottom: 20px; font-size: 16px; }
          .tt-review-btn { background: linear-gradient(135deg, ${primary}, ${secondary}); color: white; padding: 14px 28px; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.3s ease; box-shadow: 0 4px 16px ${primary}40; }
          .tt-review-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${primary}60; }
        </style>
      </head>
      <body>
        <div class="tt-widget">
          <div class="tt-no-reviews">
            <h3>No Reviews Yet</h3>
            <p>Be the first to share your experience!</p>
            <a href="${this.configService.get("FRONTEND_URL")}/record/${business.slug}" class="tt-review-btn" target="_blank">Submit Review</a>
          </div>
        </div>
      </body>
      </html>`;
    }

    const reviewsToShow = reviews.slice(0, 5);

    const reviewItems = reviewsToShow
      .map((review, index) => {
        let mediaContent = '';
        if (review.type === 'video' && review.media && review.media.length > 0) {
          const videoAsset = review.media[0];
          mediaContent = `
            <div class="tt-video-container">
              <video class="tt-video-player" controls ${autoplay ? 'autoplay muted' : ''}>
                <source src="${this.configService.get('AWS_DOMAIN_URL')}/${videoAsset.s3Key}" type="video/mp4">
                Your browser does not support video.
              </video>
            </div>
          `;
        } else if (review.type === 'audio' && review.media && review.media.length > 0) {
          const audioAsset = review.media[0];
          mediaContent = `
            <div class="tt-audio-container">
              <div class="tt-audio-visual">
                <div class="tt-audio-icon">🎵</div>
                <div class="tt-audio-waves">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
              <audio class="tt-audio-player" controls ${autoplay ? 'autoplay' : ''}>
                <source src="${this.configService.get('AWS_DOMAIN_URL')}/${audioAsset.s3Key}" type="audio/mpeg">
                Your browser does not support audio.
              </audio>
            </div>
          `;
        } else if (review.type === 'text') {
          mediaContent = `
            <div class="tt-text-highlight">
              <div class="tt-quote-icon">💬</div>
              ${review.bodyText ? `<p>${review.bodyText}</p>` : ''}
            </div>
          `;
        }

        const typeColors = {
          video: primary,
          audio: secondary,
          text: '#10b981',
          google: '#4285f4',
        };

        const typeIndicator =
          review.type === 'google'
            ? '<span class="tt-type-badge tt-google">Google</span>'
            : `<span class="tt-type-badge tt-${review.type}">${
                review.type.charAt(0).toUpperCase() + review.type.slice(1)
              }</span>`;

        return `
        <div class="tt-review-item" data-index="${index}" style="display: ${
          index === 0 ? 'flex' : 'none'
        }">
          ${typeIndicator}
          <div class="tt-rating">${'★'.repeat(review.rating || 5)}${'☆'.repeat(
          5 - (review.rating || 5),
        )}</div>
          <h3>${review.title || 'Great Review'}</h3>
          ${mediaContent}
          <small>— ${review.reviewerName || 'Customer'}</small>
          ${review.publishedAt ? `<div class="tt-date">${new Date(review.publishedAt).toLocaleDateString()}</div>` : ''}
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 10px; background: linear-gradient(135deg, ${primary}08, ${secondary}08, ${primary}05); min-height: 600px; font-family: 'Inter', sans-serif; }
        .tt-widget { max-width: 450px; height: 550px; margin: 0 auto; padding: 24px; background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'}; border-radius: 24px; box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.2), 0 0 0 1px ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}; backdrop-filter: blur(16px); position: relative; overflow: hidden; }
        .tt-widget::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, ${primary}03, transparent, ${secondary}03); pointer-events: none; }
        .tt-spotlight-container { position: relative; height: 100%; }
        .tt-review-item { position: absolute; top: -20; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .tt-rating { color: #fbbf24; font-size: 36px; margin-bottom: 5px; text-shadow: 0 4px 12px rgba(251, 191, 36, 0.4); filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.5)); }
        .tt-review-item h3 { margin: 0 0 0 0; color: ${isDark ? '#f8fafc' : '#0f172a'}; font-size: 28px; font-weight: 800; line-height: 1.2; }
        .tt-review-item p { color: ${isDark ? '#cbd5e1' : '#475569'}; line-height: 1.7; margin-bottom: 28px; font-size: 18px; max-width: 380px; }
        .tt-review-item small { background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; font-size: 16px; }
        .tt-video-container { position: relative; width: 100%; max-width: 400px; margin: 32px auto; border-radius: 28px; overflow: hidden; box-shadow: 0 24px 64px rgba(0,0,0,0.4); }
        .tt-video-player { width: 100%; height: 220px; object-fit: cover; display: block; }
        .tt-audio-container { background: linear-gradient(135deg, ${secondary}20, ${primary}20); border-radius: 24px; padding: 32px; margin: 32px auto; max-width: 380px; border: 2px solid ${secondary}40; backdrop-filter: blur(10px); }
        .tt-audio-visual { display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 24px; }
        .tt-audio-icon { font-size: 48px; }
        .tt-audio-waves { display: flex; gap: 8px; align-items: center; }
        .tt-audio-waves span { width: 8px; height: 32px; background: ${secondary}; border-radius: 4px; animation: audioWave 1.5s infinite ease-in-out; }
        .tt-audio-waves span:nth-child(2) { animation-delay: 0.1s; height: 48px; }
        .tt-audio-waves span:nth-child(3) { animation-delay: 0.2s; height: 40px; }
        .tt-audio-waves span:nth-child(4) { animation-delay: 0.3s; height: 56px; }
        .tt-audio-waves span:nth-child(5) { animation-delay: 0.4s; height: 32px; }
        .tt-audio-player { width: 100%; height: 56px; }
        .tt-text-highlight { position: relative; background: linear-gradient(135deg, ${primary}20, ${secondary}20); border-radius: 24px; padding: 40px; margin: 32px auto; max-width: 380px; border-left: 8px solid ${primary}; backdrop-filter: blur(10px); }
        .tt-quote-icon { position: absolute; top: 10px; left: 8px; font-size: 25px; background: ${isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)'}; padding: 15px; border-radius: 50%; backdrop-filter: blur(12px); box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
        .tt-type-badge { position: absolute; top: 20px; right: -5px; padding: 12px 24px; border-radius: 32px; font-size: 14px; font-weight: 800; text-transform: uppercase; color: white; backdrop-filter: blur(16px); box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
        .tt-video { background: linear-gradient(135deg, ${primary}, ${primary}cc); }
        .tt-audio { background: linear-gradient(135deg, ${secondary}, ${secondary}cc); }
        .tt-text { background: linear-gradient(135deg, ${secondary}, ${secondary}cc); }
        .tt-google { background: linear-gradient(135deg, #4285f4, #34a853); }
        .tt-date { font-size: 14px; color: ${isDark ? '#94a3b8' : '#94a3b8'}; margin-top: 5px; opacity: 0.8; }
        .tt-nav-btn { position: absolute; width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, ${primary}, ${secondary}); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; z-index: 10; transition: all 0.4s ease; box-shadow: 0 8px 32px ${primary}50; backdrop-filter: blur(12px); }
        .tt-nav-btn:hover { transform: scale(1.15); box-shadow: 0 16px 48px ${primary}70; }
        .tt-prev-btn { top: 50%; left: 24px; transform: translateY(-50%); }
        .tt-next-btn { top: 50%; right: 24px; transform: translateY(-50%); }
        .tt-nav-dots { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; z-index: 10; }
        .tt-dot { width: 16px; height: 16px; border-radius: 50%; background: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgb(40 83 139 / 30%)'}; cursor: pointer; transition: all 0.4s ease; backdrop-filter: blur(12px); }
        .tt-dot:hover { transform: scale(1.4); }
        .tt-dot.active { background: ${primary}; box-shadow: 0 0 32px ${primary}80; }
        .tt-powered { position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); font-size: 12px; color: ${isDark ? '#94a3b8' : '#94a3b8'}; z-index: 10; }
        .tt-powered a { background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-decoration: none; font-weight: 700; }
        @keyframes audioWave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
      </style>
    </head>
    <body>
      <div class="tt-widget">
        <div class="tt-spotlight-container">
          ${reviewItems}
          ${reviewsToShow.length > 1 ? `
            <div class="tt-nav-dots">
              ${reviewsToShow.map((_, i) => `<div class="tt-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
            </div>
          ` : ''}
          <div class="tt-powered">
            Powered by <a href="https://truetestify.com" target="_blank">TrueTestify</a>
          </div>
        </div>
      </div>
      <script>
        function trackEvent(eventType, action) {
          fetch('${this.configService.get('BACKEND_URL')}/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId: '${business.id}',
              widgetId: '${widget?.id || ''}',
              eventType: eventType,
              eventData: { action: action }
            })
          }).catch(() => {});
        }
        trackEvent('widget_view', 'load');
        
        (function() {
          var currentIndex = 0;
          
          function initSpotlight() {
            var reviews = document.querySelectorAll('.tt-review-item');
            var dots = document.querySelectorAll('.tt-dot');
            var container = document.querySelector('.tt-spotlight-container');
            
            function showReview(index) {
              if (index < 0 || index >= reviews.length) return;
              reviews.forEach(function(review, i) {
                review.style.display = i === index ? 'flex' : 'none';
              });
              dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
              });
              currentIndex = index;
            }
            
            dots.forEach(function(dot, index) {
              dot.addEventListener('click', function(e) {
                e.preventDefault();
                trackEvent('widget_click', 'dot_navigation');
                showReview(index);
              });
            });
            
            var startY = 0;
            if (container) {
              container.addEventListener('touchstart', function(e) {
                startY = e.touches[0].clientY;
              }, { passive: true });
              
              container.addEventListener('touchend', function(e) {
                var endY = e.changedTouches[0].clientY;
                var deltaY = startY - endY;
                if (Math.abs(deltaY) > 50) {
                  if (deltaY > 0 && currentIndex < reviews.length - 1) {
                    showReview(currentIndex + 1);
                  } else if (deltaY < 0 && currentIndex > 0) {
                    showReview(currentIndex - 1);
                  }
                }
              }, { passive: true });
            }
            
            showReview(0);
          }
          
          setTimeout(initSpotlight, 100);
        })();
      </script>
    </body>
    </html>`;
  }


  private generateFloatingWidget(
    business: any,
    reviews: any[],
    settingsJson: any = {},
    widget?: any,
  ): string {
    const isDark = settingsJson.theme === 'dark';
    const primary = settingsJson.primary || '#3b82f6';
    const secondary = settingsJson.secondary || '#10b981';
    const background =
      settingsJson.background || (isDark ? '#1f2937' : '#ffffff');

    if (reviews.length === 0) {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${business.name} Reviews</title>
        <style>
          .tt-floating { position: fixed; bottom: 24px; right: 24px; width: 320px; background: ${background}; border: 2px solid ${primary}20; border-radius: 20px; padding: 20px; box-shadow: 0 16px 48px rgba(0,0,0,0.2); z-index: 1000; backdrop-filter: blur(10px); }
          .tt-no-reviews { text-align: center; }
          .tt-no-reviews h4 { color: ${primary}; margin-bottom: 12px; font-size: 18px; font-weight: 700; }
          .tt-no-reviews p { color: ${
            isDark ? '#000000' : '#000000'
          }; margin-bottom: 16px; font-size: 14px; }
          .tt-review-btn { background: linear-gradient(135deg, ${primary}, ${secondary}); color: white; padding: 10px 20px; border: none; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.3s ease; box-shadow: 0 4px 16px ${primary}40; }
          .tt-review-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${primary}60; }
        </style>
      </head>
      <body>
        <div class="tt-floating">
          <div class="tt-no-reviews">
            <h4>No Reviews Yet</h4>
            <p>Share your experience!</p>
            <a href="${this.configService.get("FRONTEND_URL")}/record/${business.slug}" class="tt-review-btn" target="_blank">Submit Review</a>
          </div>
        </div>
      </body>
      </html>`;
    }

    // Filter to only show text and Google reviews for floating widget
    const textReviews = reviews.filter(review => review.type === 'text' || review.type === 'google');
    
    const miniReviews = textReviews
      .slice(0, 3)
      .map((review) => {
        const typeIcons = {
          text: '💬',
          google: '🌟',
        };

        const typeColors = {
          text: primary,
          google: '#4285f4',
        };

        return `
        <div class="tt-review-mini tt-${review.type}" style="border-left-color: ${typeColors[review.type]}">
          <div class="tt-mini-header">
            <span class="tt-type-icon">${typeIcons[review.type] || '💬'}</span>
            <div class="tt-rating">${'⭐'.repeat(review.rating || 5)}</div>
          </div>
          <div class="tt-mini-title">${(review.title || 'Great Review').substring(0, 32)}${(review.title || '').length > 32 ? '...' : ''}</div>
          ${review.bodyText ? `<div class="tt-mini-text">${review.bodyText.substring(0, 80)}${review.bodyText.length > 80 ? '...' : ''}</div>` : ''}
          <small>— ${review.reviewerName || 'Customer'}</small>
        </div>
      `;
      })
      .join('');
      
    // If no text reviews available, show message
    if (textReviews.length === 0) {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${business.name} Reviews</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; font-family: 'Inter', sans-serif; height: 200px; }
          .tt-floating { position: fixed; bottom: 32px; right: 32px; width: 350px; height: auto; background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'}; border: 2px solid ${primary}30; border-radius: 20px; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); z-index: 1000; backdrop-filter: blur(16px); }
          .tt-no-text { text-align: center; }
          .tt-no-text h4 { color: ${primary}; margin-bottom: 8px; font-size: 16px; font-weight: 700; }
          .tt-no-text p { color: ${isDark ? '#cbd5e1' : '#64748b'}; margin: 0; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="tt-floating">
          <div class="tt-no-text">
            <h4>💬 Text Reviews</h4>
            <p>No text reviews available yet</p>
          </div>
        </div>
      </body>
      </html>`;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; height: auto; min-height: 300px; }
        .tt-floating { position: fixed; bottom: 32px; right: 32px; width: 380px; height: auto; max-height: 500px; background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'}; border: 2px solid ${primary}30; border-radius: 20px; padding: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); z-index: 1000; transition: all 0.3s ease; backdrop-filter: blur(16px); }
        .tt-floating::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, ${primary}05, transparent, ${secondary}05); border-radius: 24px; pointer-events: none; }
        .tt-floating:hover { transform: translateY(-8px) scale(1.02); box-shadow: 0 32px 80px rgba(0,0,0,0.4); }
        .tt-floating h4 { margin: 0 0 20px 0; font-size: 18px; text-align: center; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; position: relative; z-index: 1; }
        .tt-floating h4 span { background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .tt-review-mini { margin-bottom: 16px; padding: 16px; background: ${isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.9)'}; border-radius: 12px; border-left: 4px solid; transition: all 0.3s ease; backdrop-filter: blur(8px); position: relative; overflow: hidden; }
        .tt-review-mini::before { content: ''; position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: linear-gradient(135deg, ${primary}15, ${secondary}15); border-radius: 0 16px 0 60px; }
        .tt-review-mini:hover { transform: translateX(8px) scale(1.02); box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
        .tt-review-mini:last-child { margin-bottom: 0; }
        .tt-mini-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; position: relative; z-index: 1; }
        .tt-mini-text { font-size: 13px; color: ${isDark ? '#cbd5e1' : '#64748b'}; line-height: 1.4; margin: 8px 0; position: relative; z-index: 1; }
        .tt-type-icon { font-size: 20px; }
        .tt-rating { color: #fbbf24; font-size: 16px; text-shadow: 0 2px 4px rgba(251, 191, 36, 0.3); }
        .tt-mini-title { font-size: 14px; font-weight: 600; color: ${isDark ? '#f8fafc' : '#0f172a'}; margin-bottom: 6px; line-height: 1.3; position: relative; z-index: 1; }
        .tt-review-mini small { background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 14px; font-weight: 600; position: relative; z-index: 1; }
        .tt-powered { text-align: center; margin-top: 20px; font-size: 11px; color: ${isDark ? '#94a3b8' : '#94a3b8'}; border-top: 1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'}; padding-top: 16px; position: relative; z-index: 1; }
        .tt-powered a { background: linear-gradient(135deg, ${primary}, ${secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-decoration: none; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="tt-floating">
        <h4><span>⭐ ${business.name}</span></h4>
        ${miniReviews}
        <div class="tt-powered">
          Powered by <a href="https://truetestify.com" target="_blank">TrueTestify</a>
        </div>
      </div>
    </body>
    </html>`;
  }
}
