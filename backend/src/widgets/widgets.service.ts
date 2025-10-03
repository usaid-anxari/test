import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Widget } from './entities/widget.entity';
import { EmbedToken } from './entities/embed-token.entity';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WidgetsService {
  private readonly logger = new Logger(WidgetsService.name);

  constructor(
    @InjectRepository(Widget)
    private widgetRepo: Repository<Widget>,
    private readonly configService: ConfigService,
    @InjectRepository(EmbedToken)
    private embedTokenRepo: Repository<EmbedToken>,
  ) {}

  // Milestone 7: Create widget
  async createWidget(businessId: string, dto: CreateWidgetDto) {
    // Parse settings if it's a string
    let settingsJson = dto.settingsJson;
    if (typeof settingsJson === 'string') {
      try {
        settingsJson = JSON.parse(settingsJson);
      } catch (error) {
        this.logger.warn(`Failed to parse settings JSON: ${settingsJson}`);
        settingsJson = this.getDefaultSettings(dto.style);
      }
    }

    const widget = this.widgetRepo.create({
      businessId,
      name: dto.name,
      style: dto.style,
      reviewTypes: dto.reviewTypes || ['video', 'audio', 'text'],
      settingsJson: settingsJson || this.getDefaultSettings(dto.style),
      isActive: true,
    });

    const saved = await this.widgetRepo.save(widget);
    this.logger.log(`Widget created: ${saved.id} for business: ${businessId}`);

    return saved;
  }

  // Get widgets for business
  async getWidgets(businessId: string) {
    return await this.widgetRepo.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  // Get widget by ID
  async getWidget(businessId: string, widgetId: string) {
    const widget = await this.widgetRepo.findOne({
      where: { id: widgetId, businessId },
    });

    if (!widget) {
      throw new BadRequestException('Widget not found');
    }

    return widget;
  }

  // Find widget by ID only (for embed)
  async findById(widgetId: string) {
    return await this.widgetRepo.findOne({
      where: { id: widgetId },
    });
  }

  // Update widget
  async updateWidget(
    businessId: string,
    widgetId: string,
    updates: Partial<CreateWidgetDto & { isActive?: boolean }>,
  ) {
    const widget = await this.getWidget(businessId, widgetId);

    if (updates.name) widget.name = updates.name;
    if (updates.style) widget.style = updates.style;
    if (updates.reviewTypes) widget.reviewTypes = updates.reviewTypes;
    if (updates.settingsJson) {
      // Parse settings if it's a string
      let settings = updates.settingsJson;
      if (typeof settings === 'string') {
        try {
          settings = JSON.parse(settings);
        } catch (error) {
          this.logger.warn(`Failed to parse settings JSON: ${settings}`);
        }
      }
      widget.settingsJson = settings;
    }
    if (typeof updates.isActive !== 'undefined')
      widget.isActive = updates.isActive;

    return await this.widgetRepo.save(widget);
  }

  // Delete widget
  async deleteWidget(businessId: string, widgetId: string) {
    const widget = await this.getWidget(businessId, widgetId);

    // Delete related analytics events first
    await this.widgetRepo.query(
      'DELETE FROM analytics_events WHERE widget_id = $1',
      [widgetId],
    );

    await this.widgetRepo.remove(widget);

    return { message: 'Widget deleted successfully' };
  }

  // Generate embed code
  async generateEmbedCode(businessId: string, widgetId: string) {
    const widget = await this.getWidget(businessId, widgetId);
    
    const reviewTypesParam = widget.reviewTypes ? widget.reviewTypes.join(',') : 'video,audio,text';
    
    const embedCode = `<!-- TrueTestify Widget -->
<div id="truetestify-widget-${widget.id}"></div>
<script data-widget-id="${widget.id}" data-style="${widget.style}" data-review-types="${reviewTypesParam}">
(function() {
  var widgetId = '${widget.id}';
  var style = '${widget.style}';
  var reviewTypes = '${reviewTypesParam}';
  var targetId = 'truetestify-widget-' + widgetId;
  
  var container = document.getElementById(targetId);
  if (container) {
    var url = '${this.configService.get('BACKEND_URL')}/embed/' + widgetId + '?style=' + style + '&reviewTypes=' + reviewTypes;
    fetch(url)
      .then(function(response) { return response.text(); })
      .then(function(html) {
        container.innerHTML = html;
        
        // Execute scripts for carousel and spotlight widgets
        var scripts = container.querySelectorAll('script');
        scripts.forEach(function(script) {
          var newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          document.head.appendChild(newScript);
          document.head.removeChild(newScript);
        });
      })
      .catch(function(error) {
        container.innerHTML = '<p>Unable to load reviews</p>';
      });
  }
})();
</script>`;

    return {
      widgetId: widget.id,
      style: widget.style,
      embedCode,
      iframeCode: `<iframe src=${this.configService.get('BACKEND_URL')}/embed/${
        widget.id
      } width="100%" height="400" frameborder="0" style="min-height: 400px;"></iframe>`,
    };
  }

  // Get default settings for widget style
  private getDefaultSettings(style: string) {
    const defaults = {
      grid: {
        columns: 3,
        showRating: true,
        showDate: true,
        maxReviews: 9,
      },
      carousel: {
        autoPlay: true,
        showDots: true,
        showArrows: true,
        maxReviews: 6,
      },
      spotlight: {
        showRating: true,
        showDate: true,
        autoRotate: true,
        rotateInterval: 5000,
      },
      floating: {
        position: 'bottom-right',
        showCount: true,
        maxReviews: 3,
      },
    };

    return defaults[style] || {};
  }
}
