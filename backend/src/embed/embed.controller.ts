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
  ) { }

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
    @Query('reviewTypes') reviewTypes: string = 'video,audio,text',
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

        // Filter reviews by widget's reviewTypes if available
        if (widget.reviewTypes && widget.reviewTypes.length > 0) {
          // Floating widgets only show text reviews regardless of settings
          if (widget.style === 'floating') {
            profileData.reviews = profileData.reviews.filter(review =>
              review.type === 'text'
            );
          } else if (widget.style === 'spotlight') {
            // Spotlight widgets only show video and audio reviews
            profileData.reviews = profileData.reviews.filter(review =>
              ['video', 'audio'].includes(review.type) && widget.reviewTypes.includes(review.type)
            );
          } else {
            // Carousel and Grid widgets show ALL enabled review types
            profileData.reviews = profileData.reviews.filter(review =>
              widget.reviewTypes.includes(review.type)
            );
          }
        } else {
          // Default widget behavior based on style - NO FILTERING for carousel/grid
          if (widget.style === 'floating') {
            profileData.reviews = profileData.reviews.filter(review =>
              review.type === 'text'
            );
          } else if (widget.style === 'spotlight') {
            profileData.reviews = profileData.reviews.filter(review =>
              ['video', 'audio'].includes(review.type)
            );
          }
          // Carousel and Grid show ALL review types by default - NO FILTERING
        }
      } else {
        // Handle as business slug
        business = await this.businessService.findBySlug(slugOrId);
        if (!business) {
          return res.status(404).send('<p>Business not found</p>');
        }

        profileData = await this.businessService.getPublicProfileWithReviews(
          slugOrId,
        );

        // Filter reviews by reviewTypes query parameter
        const allowedTypes = reviewTypes.split(',').filter(type =>
          ['video', 'audio', 'text'].includes(type)
        );
        if (allowedTypes.length > 0) {
          profileData.reviews = profileData.reviews.filter(review =>
            allowedTypes.includes(review.type)
          );
        }
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

  private getAvailableReviewTypes(reviews: any[]): string[] {
    const types = new Set<string>();
    reviews.forEach(review => {
      if (['video', 'audio', 'text'].includes(review.type)) {
        types.add(review.type);
      }
    });
    return Array.from(types);
  }

  private generateFilterButtons(reviews: any[], primary: string): string {
    const availableTypes = this.getAvailableReviewTypes(reviews);

    if (availableTypes.length <= 1) {
      return ''; // Don't show filters if only one type or no reviews
    }

    const typeConfig = {
      video: '🎥 Video',
      audio: '🎵 Audio',
      text: '💬 Text'
    };

    const filterButtons = availableTypes.map(type =>
      `<button class="tt-filter-btn" data-filter="${type}">${typeConfig[type]}</button>`
    ).join('');

    return `
      <div class="tt-filters" style="margin-top: 16px;">
        <button class="tt-filter-btn active" data-filter="all">All</button>
        ${filterButtons}
      </div>
    `;
  }

  private generateGridWidget(
    business: any,
    reviews: any[],
    settingsJson: any = {},
    widget?: any,
  ): string {
    const isDark = settingsJson.theme === 'dark';
    const autoplay = settingsJson.autoplay || false;
    const primary = settingsJson.primary || '#2563eb';
    const secondary = settingsJson.secondary || '#059669';
    const background = settingsJson.background || (isDark ? '#1f2937' : '#ffffff');

    if (reviews.length === 0) {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${business.name} Reviews</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; padding: 20px; background: ${isDark ? '#0f172a' : '#f8fafc'}; min-height: 100vh; font-family: 'Inter', sans-serif; }
          .tt-widget { max-width: 1200px; margin: 0 auto; padding: 40px; background: ${background}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; }
          .tt-no-reviews { text-align: center; padding: 80px 40px; border: 2px dashed ${isDark ? '#4b5563' : '#d1d5db'}; border-radius: 8px; background: ${isDark ? '#374151' : '#f9fafb'}; }
          .tt-no-reviews h3 { color: ${isDark ? '#f9fafb' : '#111827'}; margin-bottom: 16px; font-size: 24px; font-weight: 700; }
          .tt-no-reviews p { color: ${isDark ? '#9ca3af' : '#6b7280'}; margin-bottom: 24px; font-size: 16px; }
          .tt-review-btn { background: ${primary}; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s ease; }
          .tt-review-btn:hover { background: ${primary}dd; transform: translateY(-1px); }
        </style>
      </head>
      <body>
        <div class="tt-widget">
          <div class="tt-no-reviews">
            <h3>📋 No Reviews Yet</h3>
            <p>Be the first to share your experience!</p>
            <a href="${this.configService.get("FRONTEND_URL")}/record/${business.slug}" class="tt-review-btn" target="_blank">Submit Review</a>
          </div>
        </div>
      </body>
      </html>`;
    }

    const reviewCards = reviews
      .slice(0, 12) // Limit for performance
      .map((review) => {
        let mediaContent = '';

        if (review.type === 'video' && review.mediaAssets && review.mediaAssets.length > 0) {
          const videoAsset = review.mediaAssets[0];
          mediaContent = `
            <div class="tt-video-container">
              <video class="tt-video-player" controls ${autoplay ? 'autoplay muted' : ''}>
                <source src="${this.configService.get('AWS_DOMAIN_URL')}/${videoAsset.s3Key}" type="video/mp4">
                Your browser does not support video.
              </video>
            </div>
          `;
        } else if (review.type === 'audio' && review.mediaAssets && review.mediaAssets.length > 0) {
          const audioAsset = review.mediaAssets[0];
          mediaContent = `
            <div class="tt-audio-container">
              <div class="tt-audio-header">
                <span class="tt-media-icon">🎧</span>
                <span class="tt-audio-title">Audio Review</span>
              </div>
              <div class="tt-audio-visualizer">
                <div class="tt-audio-bar"></div>
                <div class="tt-audio-bar"></div>
                <div class="tt-audio-bar"></div>
                <div class="tt-audio-bar"></div>
                <div class="tt-audio-bar"></div>
              </div>
              <audio class="tt-audio-player" controls ${autoplay ? 'autoplay' : ''}>
                <source src="${this.configService.get('AWS_DOMAIN_URL')}/${audioAsset.s3Key}" type="audio/mpeg">
                Your browser does not support audio.
              </audio>
            </div>
          `;
        } else if (review.type === 'text') {
          mediaContent = `
            <div class="tt-text-container">
              <div class="tt-text-header">
                <span class="tt-media-icon">💬</span>
                <span>Written Review</span>
              </div>
              <div class="tt-text-content">
                ${review.bodyText ? `<p>"${review.bodyText}"</p>` : '<p>"Great experience with this business!"</p>'}
              </div>
            </div>
          `;
        } else if (review.type === 'google') {
          mediaContent = `
            <div class="tt-google-container">
              <div class="tt-google-header">
                <span class="tt-media-icon">⭐</span>
                <span>Google Review</span>
              </div>
              <div class="tt-text-content">
                ${review.bodyText ? `<p>"${review.bodyText}"</p>` : '<p>"Excellent service and experience!"</p>'}
              </div>
            </div>
          `;
        }

        return `
        <div class="tt-review-card tt-${review.type}">
          <div class="tt-card-header">
            <div class="tt-rating-display">
              <div class="tt-stars">${'★'.repeat(review.rating || 5)}${'☆'.repeat(5 - (review.rating || 5))}</div>
              <div class="tt-rating-text">${review.rating || 5}/5 stars</div>
            </div>
          </div>
          <h4 class="tt-review-title">${review.title || 'Amazing Experience'}</h4>
          ${mediaContent}
          <div class="tt-reviewer-section">
            <div class="tt-reviewer-avatar">${(review.reviewerName || 'Customer').charAt(0).toUpperCase()}</div>
            <div class="tt-reviewer-info">
              <div class="tt-reviewer-name">${review.reviewerName || 'Verified Customer'}</div>
              <div class="tt-review-date">${review.publishedAt ? new Date(review.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</div>
            </div>
          </div>
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
        body { margin: 0; padding: 20px; background: ${isDark ? '#0f172a' : '#f8fafc'}; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        /* Widget Container */
        .tt-widget { max-width: 1200px; margin: 0 auto; padding: 40px; background: ${background}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; }
        
        /* Header */
        .tt-header { text-align: center; margin-bottom: 40px; padding: 32px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; }
        .tt-header h3 { margin: 0 0 12px 0; color: ${isDark ? '#f9fafb' : '#111827'}; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; }
        .tt-header p { color: ${isDark ? '#9ca3af' : '#6b7280'}; margin: 0; font-size: 16px; font-weight: 500; }
        /* Grid Layout */
        .tt-reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; }
        
        /* Review Cards */
        .tt-review-card { background: ${isDark ? '#1f2937' : '#ffffff'}; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; transition: all 0.2s ease; }
        .tt-review-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        
        /* Card Header */
        .tt-card-header { margin-bottom: 16px; }
        .tt-rating-display { display: flex; align-items: center; gap: 8px; }
        .tt-stars { color: #f59e0b; font-size: 20px; }
        .tt-rating-text { color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px; font-weight: 500; }
        .tt-review-title { margin: 0 0 20px 0; color: ${isDark ? '#f9fafb' : '#111827'}; font-size: 20px; font-weight: 700; line-height: 1.3; }
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
        /* Video Styles */
        .tt-video-container { margin: 16px 0; }
        .tt-video-player { width: 100%; height: 200px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        
        /* Audio Styles */
        .tt-audio-container { margin: 16px 0; padding: 20px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; }
        .tt-audio-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .tt-audio-title { color: ${isDark ? '#f9fafb' : '#111827'}; font-weight: 600; font-size: 14px; }
        .tt-audio-visualizer { display: flex; align-items: center; justify-content: center; gap: 3px; margin-bottom: 16px; }
        .tt-audio-bar { width: 3px; height: 16px; background: ${primary}; border-radius: 2px; animation: audioWave 1.5s infinite ease-in-out; }
        .tt-audio-bar:nth-child(2) { animation-delay: 0.1s; height: 24px; }
        .tt-audio-bar:nth-child(3) { animation-delay: 0.2s; height: 20px; }
        .tt-audio-bar:nth-child(4) { animation-delay: 0.3s; height: 28px; }
        .tt-audio-bar:nth-child(5) { animation-delay: 0.4s; height: 16px; }
        .tt-audio-player { width: 100%; height: 32px; }
        
        /* Text Styles */
        .tt-text-container, .tt-google-container { margin: 16px 0; padding: 20px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; }
        .tt-text-header, .tt-google-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .tt-text-content p { color: ${isDark ? '#d1d5db' : '#374151'}; font-size: 14px; line-height: 1.5; margin: 0; font-style: italic; }
        
        /* Media Labels */
        .tt-media-label { display: flex; align-items: center; gap: 6px; justify-content: center; margin-top: 8px; color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px; font-weight: 500; }
        .tt-media-icon { font-size: 14px; }
        
        /* Reviewer Section */
        .tt-reviewer-section { display: flex; align-items: center; gap: 12px; margin-top: 20px; }
        .tt-reviewer-avatar { width: 36px; height: 36px; background: ${primary}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
        .tt-reviewer-info { flex: 1; }
        .tt-reviewer-name { color: ${isDark ? '#f9fafb' : '#111827'}; font-weight: 600; font-size: 14px; margin-bottom: 2px; }
        .tt-review-date { color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px; }
        
        /* Filters */
        .tt-filters { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 16px; }
        .tt-filter-btn { padding: 8px 16px; border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; background: ${isDark ? '#374151' : '#ffffff'}; color: ${isDark ? '#d1d5db' : '#374151'}; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .tt-filter-btn:hover { background: ${isDark ? '#4b5563' : '#f9fafb'}; }
        .tt-filter-btn.active { background: ${primary}; color: white; border-color: ${primary}; }
        
        /* Powered By */
        .tt-powered { text-align: center; margin-top: 40px; padding: 20px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; }
        .tt-powered a { color: ${primary}; text-decoration: none; font-weight: 600; font-size: 14px; }
        .tt-powered a:hover { text-decoration: underline; }
        
        /* Animations */
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
        
        // Add click tracking and filter functionality
        document.addEventListener('click', function(e) {
          if (e.target.closest('.tt-review-card')) {
            trackEvent('widget_click', 'review_card');
          }
          if (e.target.closest('.tt-powered a')) {
            trackEvent('widget_click', 'powered_by');
          }
        });
        
        // Filter functionality
        setTimeout(function() {
          var filterBtns = document.querySelectorAll('.tt-filter-btn');
          filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
              var filter = this.getAttribute('data-filter');
              var cards = document.querySelectorAll('.tt-review-card');
              
              // Update active button
              filterBtns.forEach(function(b) { b.classList.remove('active'); });
              this.classList.add('active');
              
              // Filter cards
              cards.forEach(function(card) {
                if (filter === 'all' || card.classList.contains('tt-' + filter)) {
                  card.style.display = 'block';
                } else {
                  card.style.display = 'none';
                }
              });
              
              trackEvent('widget_click', 'filter_' + filter);
            });
          });
        }, 100);
      </script>
      <div class="tt-widget">
        <div class="tt-header">
          <h3>${business.name} Reviews</h3>
          <p>Customer experiences and testimonials</p>
          ${this.generateFilterButtons(reviews, primary)}
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
    const primary = settingsJson.primary || '#2563eb';
    const secondary = settingsJson.secondary || '#059669';
    const background = settingsJson.background || (isDark ? '#1f2937' : '#ffffff');

    if (reviews.length === 0) {
      return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 20px; background: ${isDark ? '#0f172a' : '#f8fafc'}; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .tt-widget { max-width: 1000px; margin: 0 auto; padding: 48px; background: ${background}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; }
        .tt-no-reviews { text-align: center; padding: 80px 40px; border: 2px dashed ${isDark ? '#4b5563' : '#d1d5db'}; border-radius: 8px; background: ${isDark ? '#374151' : '#f9fafb'}; }
        .tt-no-reviews h3 { color: ${isDark ? '#f9fafb' : '#111827'}; margin-bottom: 16px; font-size: 24px; font-weight: 700; }
        .tt-no-reviews p { color: ${isDark ? '#9ca3af' : '#6b7280'}; margin-bottom: 24px; font-size: 16px; }
        .tt-review-btn { background: ${primary}; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s ease; }
        .tt-review-btn:hover { background: ${primary}dd; transform: translateY(-1px); }
      </style>
    </head>
    <body>
      <div class="tt-widget">
        <div class="tt-no-reviews">
          <h3>📝 No Reviews Yet</h3>
          <p>Be the first to share your experience!</p>
          <a href="${this.configService.get("FRONTEND_URL")}/record/${business.slug}" class="tt-review-btn" target="_blank">Submit Review</a>
        </div>
      </div>
    </body>
    </html>`;
    }

    const reviewCards = reviews
      .slice(0, 12)
      .map((review, index) => {
        console.log(`Processing review ${index + 1}:`, { type: review.type, title: review.title, index });
        let mediaContent = '';

        if (review.type === 'video' && review.mediaAssets && review.mediaAssets.length > 0) {
          const videoAsset = review.mediaAssets[0];
          mediaContent = `
          <div class="tt-video-container">
            <video class="tt-video-player" controls ${autoplay ? 'autoplay muted' : ''}>
              <source src="${this.configService.get('AWS_DOMAIN_URL')}/${videoAsset.s3Key}" type="video/mp4">
              Your browser does not support video.
            </video>
          </div>
        `;
        } else if (review.type === 'audio' && review.mediaAssets && review.mediaAssets.length > 0) {
          const audioAsset = review.mediaAssets[0];
          mediaContent = `
          <div class="tt-audio-container">
            <div class="tt-audio-header">
              <span class="tt-media-icon">🎧</span>
              <span class="tt-audio-title">Audio Review</span>
            </div>
            <div class="tt-audio-visualizer">
              <div class="tt-audio-bar"></div>
              <div class="tt-audio-bar"></div>
              <div class="tt-audio-bar"></div>
              <div class="tt-audio-bar"></div>
              <div class="tt-audio-bar"></div>
            </div>
            <audio class="tt-audio-player" controls ${autoplay ? 'autoplay' : ''}>
              <source src="${this.configService.get('AWS_DOMAIN_URL')}/${audioAsset.s3Key}" type="audio/mpeg">
              Your browser does not support audio.
            </audio>
          </div>
        `;
        } else if (review.type === 'text') {
          const textContent = review.bodyText || 'Great experience with this business!';
          mediaContent = `
          <div class="tt-text-container">
            <div class="tt-text-header">
              <span class="tt-media-icon">💬</span>
              <span>Written Review</span>
            </div>
            <div class="tt-text-content">
              <p>"${textContent}"</p>
            </div>
          </div>
        `;
        } else if (review.type === 'google') {
          const textContent = review.bodyText || review.content || review.reviewText || 'Excellent service and experience!';
          mediaContent = `
          <div class="tt-google-container">
            <div class="tt-google-header">
              <span class="tt-media-icon">⭐</span>
              <span>Google Review</span>
            </div>
            <div class="tt-text-content">
              <p>"${textContent}"</p>
            </div>
          </div>
        `;
        }

        const slideHtml = `
        <div class="tt-carousel-slide tt-${review.type}" data-slide="${index}">
          <div class="tt-slide-header">
            <div class="tt-rating-display">
              <div class="tt-stars">${'★'.repeat(review.rating || 5)}${'☆'.repeat(5 - (review.rating || 5))}</div>
              <div class="tt-rating-text">${review.rating || 5} out of 5 stars</div>
            </div>
          </div>
          <h3 class="tt-review-title">${review.title || 'Amazing Experience'}</h3>
          ${mediaContent}
          <div class="tt-reviewer-section">
            <div class="tt-reviewer-avatar">${(review.reviewerName || 'Customer').charAt(0).toUpperCase()}</div>
            <div class="tt-reviewer-info">
              <div class="tt-reviewer-name">${review.reviewerName || 'Verified Customer'}</div>
              <div class="tt-review-date">${review.publishedAt ? new Date(review.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</div>
            </div>
          </div>
        </div>
      `;
        console.log(`Generated slide ${index + 1} for ${review.type} review:`, review.title);
        return slideHtml;
      })
      .join('');

    console.log(`Generated ${reviews.slice(0, 12).length} carousel slides total`);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${business.name} Reviews</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; padding: 20px; background: ${isDark ? '#0f172a' : '#f8fafc'}; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        /* Widget Container */
        .tt-widget { max-width: 1200px; margin: 0 auto; padding: 40px; background: ${background}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; }
        
        /* Header */
        .tt-header { text-align: center; margin-bottom: 40px; padding: 32px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; }
        .tt-header h3 { margin: 0 0 12px 0; color: ${isDark ? '#f9fafb' : '#111827'}; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; }
        .tt-header p { color: ${isDark ? '#9ca3af' : '#6b7280'}; margin: 0; font-size: 16px; font-weight: 500; }
        
        /* Carousel Container */
        .tt-carousel-container { position: relative; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); background: ${isDark ? '#1f2937' : '#ffffff'}; border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; }
        .tt-carousel { display: flex; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .tt-carousel-slide { min-width: 100%; padding: 48px 40px; background: ${isDark ? '#1f2937' : '#ffffff'}; position: relative; text-align: center; display: flex; flex-direction: column; justify-content: center; min-height: 500px; }
        
        /* Slide Header */
        .tt-slide-header { margin-bottom: 24px; }
        .tt-rating-display { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .tt-stars { color: #f59e0b; font-size: 32px; }
        .tt-rating-text { color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 14px; font-weight: 500; }
        .tt-review-title { margin: 0 0 32px 0; color: ${isDark ? '#f9fafb' : '#111827'}; font-size: 28px; font-weight: 700; line-height: 1.3; }
        
        /* Video Styles */
        .tt-video-container { margin: 24px auto; max-width: 600px; }
        .tt-video-player { width: 100%; height: 300px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        
        /* Audio Styles */
        .tt-audio-container { margin: 24px auto; max-width: 500px; padding: 24px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; }
        .tt-audio-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; justify-content: center; }
        .tt-audio-title { color: ${isDark ? '#f9fafb' : '#111827'}; font-weight: 600; font-size: 16px; }
        .tt-audio-visualizer { display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 20px; }
        .tt-audio-bar { width: 4px; height: 20px; background: ${primary}; border-radius: 2px; animation: audioWave 1.5s infinite ease-in-out; }
        .tt-audio-bar:nth-child(2) { animation-delay: 0.1s; height: 30px; }
        .tt-audio-bar:nth-child(3) { animation-delay: 0.2s; height: 25px; }
        .tt-audio-bar:nth-child(4) { animation-delay: 0.3s; height: 35px; }
        .tt-audio-bar:nth-child(5) { animation-delay: 0.4s; height: 20px; }
        .tt-audio-player { width: 100%; height: 40px; }
        
        /* Text Styles */
        .tt-text-container, .tt-google-container { margin: 24px auto; max-width: 600px; padding: 32px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; }
        .tt-text-header, .tt-google-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; justify-content: center; }
        .tt-text-content p { color: ${isDark ? '#d1d5db' : '#374151'}; font-size: 18px; line-height: 1.6; margin: 0; font-style: italic; }
        
        /* Media Labels */
        .tt-media-label { display: flex; align-items: center; gap: 8px; justify-content: center; margin-top: 12px; color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 14px; font-weight: 500; }
        .tt-media-icon { font-size: 18px; }
        
        /* Reviewer Section */
        .tt-reviewer-section { display: flex; align-items: center; gap: 16px; margin-top: 32px; justify-content: center; }
        .tt-reviewer-avatar { width: 48px; height: 48px; background: ${primary}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
        .tt-reviewer-info { text-align: left; }
        .tt-reviewer-name { color: ${isDark ? '#f9fafb' : '#111827'}; font-weight: 600; font-size: 16px; margin-bottom: 4px; }
        .tt-review-date { color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 14px; }
        
        /* Navigation */
        .tt-carousel-nav { display: flex; justify-content: center; gap: 16px; margin-top: 32px; }
        .tt-nav-btn { background: ${primary}; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; font-size: 14px; }
        .tt-nav-btn:hover { background: ${primary}dd; transform: translateY(-1px); }
        .tt-nav-btn:disabled { background: ${isDark ? '#4b5563' : '#d1d5db'}; cursor: not-allowed; transform: none; }
        
        /* Filters */
        .tt-filters { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 16px; }
        .tt-filter-btn { padding: 8px 16px; border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'}; background: ${isDark ? '#374151' : '#ffffff'}; color: ${isDark ? '#d1d5db' : '#374151'}; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .tt-filter-btn:hover { background: ${isDark ? '#4b5563' : '#f9fafb'}; }
        .tt-filter-btn.active { background: ${primary}; color: white; border-color: ${primary}; }
        
        /* Powered By */
        .tt-powered { text-align: center; margin-top: 40px; padding: 20px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; }
        .tt-powered a { color: ${primary}; text-decoration: none; font-weight: 600; font-size: 14px; }
        .tt-powered a:hover { text-decoration: underline; }
        
        /* Animations */
        @keyframes audioWave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
      </style>
    </head>
    <body>
      <div class="tt-widget">
        <div class="tt-header">
          <h3>${business.name} Reviews</h3>
          <p>Customer experiences and testimonials</p>
          ${this.generateFilterButtons(reviews, primary)}
        </div>
        <div class="tt-carousel-container">
          <div class="tt-carousel" id="ttCarousel">
            ${reviewCards}
          </div>
        </div>
        <div class="tt-carousel-nav">
          <button class="tt-nav-btn" id="prevBtn">← Previous</button>
          <button class="tt-nav-btn" id="nextBtn">Next →</button>
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
              widgetId: '${widget?.id || ''}',
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
            
            // Filter functionality
            var filterBtns = document.querySelectorAll('.tt-filter-btn');
            filterBtns.forEach(function(btn) {
              btn.addEventListener('click', function() {
                var filter = this.getAttribute('data-filter');
                var slides = document.querySelectorAll('.tt-carousel-slide');
                
                filterBtns.forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                
                var visibleSlides = [];
                slides.forEach(function(slide, index) {
                  if (filter === 'all' || slide.classList.contains('tt-' + filter)) {
                    slide.style.display = 'flex';
                    visibleSlides.push(index);
                  } else {
                    slide.style.display = 'none';
                  }
                });
                
                if (visibleSlides.length > 0) {
                  currentSlide = 0;
                  totalSlides = visibleSlides.length;
                  updateCarousel();
                }
                
                trackEvent('widget_click', 'filter_' + filter);
              });
            });
            
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
    const primary = settingsJson.primary || '#2563eb';
    const secondary = settingsJson.secondary || '#059669';
    const background = settingsJson.background || (isDark ? '#1f2937' : '#ffffff');

    // Filter to only show audio and video reviews for spotlight widget
    const mediaReviews = reviews.filter(review => review.type === 'video' || review.type === 'audio');

    if (mediaReviews.length === 0) {
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${business.name} Reviews</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; padding: 20px; background: ${isDark ? '#0f172a' : '#f8fafc'}; min-height: 100vh; font-family: 'Inter', sans-serif; }
          .tt-widget { max-width: 450px; margin: 0 auto; padding: 40px; background: ${background}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; }
          .tt-no-reviews { text-align: center; padding: 60px 30px; border: 2px dashed ${isDark ? '#4b5563' : '#d1d5db'}; border-radius: 8px; background: ${isDark ? '#374151' : '#f9fafb'}; }
          .tt-no-reviews h3 { color: ${isDark ? '#f9fafb' : '#111827'}; margin-bottom: 16px; font-size: 20px; font-weight: 700; }
          .tt-no-reviews p { color: ${isDark ? '#9ca3af' : '#6b7280'}; margin-bottom: 24px; font-size: 14px; }
          .tt-review-btn { background: ${primary}; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.2s ease; }
          .tt-review-btn:hover { background: ${primary}dd; transform: translateY(-1px); }
        </style>
      </head>
      <body>
        <div class="tt-widget">
          <div class="tt-no-reviews">
            <h3>🎬 No Media Reviews</h3>
            <p>No video or audio reviews available yet</p>
            <a href="${this.configService.get("FRONTEND_URL")}/record/${business.slug}" class="tt-review-btn" target="_blank">Submit Review</a>
          </div>
        </div>
      </body>
      </html>`;
    }

    const reviewsToShow = mediaReviews.slice(0, 5); // Limit for performance

    const reviewItems = reviewsToShow
      .map((review, index) => {
        let mediaContent = '';
        if (review.type === 'video' && review.mediaAssets && review.mediaAssets.length > 0) {
          const videoAsset = review.mediaAssets[0];
          mediaContent = `
            <div class="tt-video-container">
              <video class="tt-video-player" controls ${autoplay ? 'autoplay muted' : ''}>
                <source src="${this.configService.get('AWS_DOMAIN_URL')}/${videoAsset.s3Key}" type="video/mp4">
                Your browser does not support video.
              </video>
            </div>
          `;
        } else if (review.type === 'audio' && review.mediaAssets && review.mediaAssets.length > 0) {
          const audioAsset = review.mediaAssets[0];
          mediaContent = `
            <div class="tt-audio-container">
              <div class="tt-audio-header">
                <span class="tt-media-icon">🎧</span>
                <span class="tt-audio-title">Audio Review</span>
              </div>
              <div class="tt-audio-visualizer">
                <div class="tt-audio-bar"></div>
                <div class="tt-audio-bar"></div>
                <div class="tt-audio-bar"></div>
                <div class="tt-audio-bar"></div>
                <div class="tt-audio-bar"></div>
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
            : `<span class="tt-type-badge tt-${review.type}">${review.type.charAt(0).toUpperCase() + review.type.slice(1)
            }</span>`;

        return `
        <div class="tt-review-item" data-index="${index}" ${index === 0 ? '' : 'style="display: none"'}>
          <div class="tt-review-header">
            <div class="tt-rating-display">
              <div class="tt-stars">${'★'.repeat(review.rating || 5)}${'☆'.repeat(5 - (review.rating || 5))}</div>
              <div class="tt-rating-text">${review.rating || 5} out of 5 stars</div>
            </div>
            <h3 class="tt-review-title">${review.title || 'Amazing Experience'}</h3>
          </div>
          <div class="tt-review-content">
            ${mediaContent}
          </div>
          <div class="tt-review-footer">
            <div class="tt-reviewer-section">
              <div class="tt-reviewer-avatar">${(review.reviewerName || 'Customer').charAt(0).toUpperCase()}</div>
              <div class="tt-reviewer-info">
                <div class="tt-reviewer-name">${review.reviewerName || 'Verified Customer'}</div>
                <div class="tt-review-date">${review.publishedAt ? new Date(review.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</div>
              </div>
            </div>
          </div>
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
        body { margin: 0; padding: 20px; background: ${isDark ? '#0f172a' : '#f8fafc'}; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        /* Widget Container - Professional Design with Proper Structure */
        .tt-widget { 
          max-width: 450px; 
          height: 575px; 
          margin: 0 auto; 
          padding: 15px; 
          background: ${background}; 
          border-radius: 12px; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
          border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; 
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        
        /* Header Section - Fixed Position */
        .tt-header { 
          text-align: center; 
          padding: 20px; 
          background: ${isDark ? '#374151' : '#f9fafb'}; 
          border-radius: 8px; 
          border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; 
          flex-shrink: 0;
        }
        .tt-header h3 { margin: 0 0 6px 0; color: ${isDark ? '#f9fafb' : '#111827'}; font-size: 20px; font-weight: 800; letter-spacing: -0.025em; }
        .tt-header p { color: ${isDark ? '#9ca3af' : '#6b7280'}; margin: 0; font-size: 12px; font-weight: 500; }
        
        /* Main Content Section - Flexible */
        .tt-spotlight-container { 
          position: relative; 
          flex: 1; 
          margin: 16px 0; 
          background: ${isDark ? '#1f2937' : '#ffffff'}; 
          border-radius: 8px; 
          border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
          overflow: hidden;
        }
        .tt-review-item { 
          position: absolute; 
          top: -10px; 
          left: 0; 
          width: 100%; 
          height: 100%; 
          display: flex !important; 
          flex-direction: column; 
          justify-content: space-between; 
          align-items: center; 
          text-align: center; 
          padding: 20px 20px; 
          transition: all 0.3s ease;
          opacity: 1;
          visibility: visible;
        }
        .tt-review-item[style*="display: none"] {
          opacity: 0;
          visibility: hidden;
        }
        
        /* Review Content Structure */
        .tt-review-header { flex-shrink: 0; margin-bottom: 16px; }
        .tt-review-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .tt-review-footer { flex-shrink: 0; margin-top: 16px; }
        
        /* Rating Display - Professional Style */
        .tt-rating-display { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-bottom: 12px; }
        .tt-stars { color: #f59e0b; font-size: 20px; }
        .tt-rating-text { color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 11px; font-weight: 500; }
        .tt-review-title { margin: 0; color: ${isDark ? '#f9fafb' : '#111827'}; font-size: 18px; font-weight: 700; line-height: 1.3; }
        
        /* Video Styles - Professional */
        .tt-video-container { margin: 0 auto; max-width: 280px; }
        .tt-video-player { width: 100%; height: 160px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        
        /* Audio Styles - Professional */
        .tt-audio-container { margin: 0 auto; max-width: 260px; padding: 16px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 8px; border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; }
        .tt-audio-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; justify-content: center; }
        .tt-audio-title { color: ${isDark ? '#f9fafb' : '#111827'}; font-weight: 600; font-size: 13px; }
        .tt-audio-visualizer { display: flex; align-items: center; justify-content: center; gap: 3px; margin-bottom: 12px; }
        .tt-audio-bar { width: 3px; height: 14px; background: ${primary}; border-radius: 2px; animation: audioWave 1.5s infinite ease-in-out; }
        .tt-audio-bar:nth-child(2) { animation-delay: 0.1s; height: 20px; }
        .tt-audio-bar:nth-child(3) { animation-delay: 0.2s; height: 17px; }
        .tt-audio-bar:nth-child(4) { animation-delay: 0.3s; height: 24px; }
        .tt-audio-bar:nth-child(5) { animation-delay: 0.4s; height: 14px; }
        .tt-audio-player { width: 100%; height: 30px; }
        
        /* Media Labels - Professional */
        .tt-media-label { display: flex; align-items: center; gap: 6px; justify-content: center; margin-top: 8px; color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 12px; font-weight: 500; }
        .tt-media-icon { font-size: 14px; }
        
        /* Reviewer Section - Professional */
        .tt-reviewer-section { display: flex; align-items: center; gap: 10px; justify-content: center; }
        .tt-reviewer-avatar { width: 32px; height: 32px; background: ${primary}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
        .tt-reviewer-info { text-align: left; }
        .tt-reviewer-name { color: ${isDark ? '#f9fafb' : '#111827'}; font-weight: 600; font-size: 13px; margin-bottom: 2px; }
        .tt-review-date { color: ${isDark ? '#9ca3af' : '#6b7280'}; font-size: 11px; }
        
        /* Navigation Dots - Professional */
        .tt-nav-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 10; }
        .tt-dot { width: 8px; height: 8px; border-radius: 50%; background: ${isDark ? '#4b5563' : '#d1d5db'}; cursor: pointer; transition: all 0.2s ease; }
        .tt-dot:hover { background: ${isDark ? '#6b7280' : '#9ca3af'}; }
        .tt-dot.active { background: ${primary}; }
        
        /* Footer Section - Fixed Position */
        .tt-footer { 
          text-align: center; 
          padding: 12px; 
          background: ${isDark ? '#374151' : '#f9fafb'}; 
          border-radius: 8px; 
          border: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; 
          flex-shrink: 0;
        }
        .tt-footer a { color: ${primary}; text-decoration: none; font-weight: 600; font-size: 11px; }
        .tt-footer a:hover { text-decoration: underline; }
        
        /* Animations */
        @keyframes audioWave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
      </style>
    </head>
    <body>
      <div class="tt-widget">
        <div class="tt-header">
          <h3>${business.name} Reviews</h3>
          <p>Audio & Video Testimonials</p>
        </div>
        <div class="tt-spotlight-container">
          ${reviewItems}
          ${reviewsToShow.length > 1 ? `
            <div class="tt-nav-dots">
              ${reviewsToShow.map((_, i) => `<div class="tt-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
            </div>
          ` : ''}
        </div>
        <div class="tt-footer">
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
    const primary = settingsJson.primary || '#2563eb';
    const secondary = settingsJson.secondary || '#059669';
    const background = settingsJson.background || (isDark ? '#1f2937' : '#ffffff');

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
          .tt-no-reviews p { color: ${isDark ? '#000000' : '#000000'
        }; margin: 0 0 16px 0; font-size: 14px; }
          .tt-review-btn { background: linear-gradient(135deg, ${primary}, ${secondary}); color: white; padding: 10px 20px; border: none; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.3s ease; box-shadow: 0 4px 16px ${primary}40; }
          .tt-review-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${primary}60; }
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
          
          // Add click tracking
          document.addEventListener('click', function(e) {
            if (e.target.closest('.tt-review-btn')) {
              trackEvent('widget_click', 'submit_review_button');
            }
            if (e.target.closest('.tt-floating')) {
              trackEvent('widget_click', 'floating_widget_no_reviews');
            }
          });
        </script>
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
          
          // Add click tracking
          document.addEventListener('click', function(e) {
            if (e.target.closest('.tt-floating')) {
              trackEvent('widget_click', 'floating_widget_empty');
            }
          });
        </script>
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; }
        .tt-floating { position: fixed; bottom: 24px; right: 24px; width: 360px; max-height: 480px; overflow-y: auto; background: ${background}; border: 1px solid ${isDark ? '#374151' : '#e5e7eb'}; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 1000; }
        .tt-floating::-webkit-scrollbar { width: 6px; }
        .tt-floating::-webkit-scrollbar-track { background: ${isDark ? '#374151' : '#f1f5f9'}; border-radius: 3px; }
        .tt-floating::-webkit-scrollbar-thumb { background: ${primary}; border-radius: 3px; }
        .tt-floating::-webkit-scrollbar-thumb:hover { background: ${primary}dd; }
        .tt-floating h4 { margin: 0 0 20px 0; font-size: 18px; text-align: center; font-weight: 700; color: ${primary}; }
        .tt-review-mini { margin-bottom: 16px; padding: 16px; background: ${isDark ? '#374151' : '#f9fafb'}; border-radius: 12px; border-left: 4px solid; transition: all 0.2s ease; }
        .tt-review-mini:hover { transform: translateX(4px); }
        .tt-review-mini:last-child { margin-bottom: 0; }
        .tt-mini-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .tt-mini-text { font-size: 13px; color: ${isDark ? '#d1d5db' : '#6b7280'}; line-height: 1.4; margin: 8px 0; }
        .tt-type-icon { font-size: 16px; }
        .tt-rating { color: #f59e0b; font-size: 14px; }
        .tt-mini-title { font-size: 14px; font-weight: 600; color: ${isDark ? '#f9fafb' : '#111827'}; margin-bottom: 6px; line-height: 1.3; }
        .tt-review-mini small { color: ${primary}; font-size: 12px; font-weight: 600; }
        .tt-powered { text-align: center; margin-top: 20px; font-size: 11px; color: ${isDark ? '#9ca3af' : '#6b7280'}; border-top: 1px solid ${isDark ? '#4b5563' : '#e5e7eb'}; padding-top: 16px; }
        .tt-powered a { color: ${primary}; text-decoration: none; font-weight: 600; }
        .tt-powered a:hover { text-decoration: underline; }
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
        
        trackEvent('widget_view', 'load');
        
        document.addEventListener('click', function(e) {
          if (e.target.closest('.tt-review-mini')) {
            trackEvent('widget_click', 'review_mini');
          }
          if (e.target.closest('.tt-powered a')) {
            trackEvent('widget_click', 'powered_by');
          }
          if (e.target.closest('.tt-floating')) {
            trackEvent('widget_click', 'floating_widget');
          }
        });
      </script>
      <div class="tt-floating">
        <h4>⭐ ${business.name}</h4>
        ${miniReviews}
        <div class="tt-powered">
          Powered by <a href="https://truetestify.com" target="_blank">TrueTestify</a>
        </div>
      </div>
    </body>
    </html>`;
  }
}
