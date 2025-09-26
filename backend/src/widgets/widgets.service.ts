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
    private configService: ConfigService,
    @InjectRepository(EmbedToken)
    private embedTokenRepo: Repository<EmbedToken>,
  ) {}
  
  // Milestone 7: Create widget
  async createWidget(businessId: string, dto: CreateWidgetDto) {
    const widget = this.widgetRepo.create({
      businessId,
      name: dto.name,
      style: dto.style,
      settingsJson: dto.settings || this.getDefaultSettings(dto.style),
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
  async updateWidget(businessId: string, widgetId: string, updates: Partial<CreateWidgetDto & { isActive?: boolean }>) {
    const widget = await this.getWidget(businessId, widgetId);
    
    if (updates.name) widget.name = updates.name;
    if (updates.style) widget.style = updates.style;
    if (updates.settings) widget.settingsJson = updates.settings;
    if (typeof updates.isActive !== 'undefined') widget.isActive = updates.isActive;

    return await this.widgetRepo.save(widget);
  }

  // Delete widget
  async deleteWidget(businessId: string, widgetId: string) {
    const widget = await this.getWidget(businessId, widgetId);
    
    // Delete related analytics events first
    await this.widgetRepo.query(
      'DELETE FROM analytics_events WHERE widget_id = $1',
      [widgetId]
    );
    
    await this.widgetRepo.remove(widget);
    
    return { message: 'Widget deleted successfully' };
  }

  // Generate embed code
  async generateEmbedCode(businessId: string, widgetId: string) {
    const widget = await this.getWidget(businessId, widgetId);
    
    const embedCode = `<!-- TrueTestify Widget -->
<div id="truetestify-widget-${widget.id}"></div>
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'http://localhost:4000/embed.js';
  script.setAttribute('data-widget-id', '${widget.id}');
  script.setAttribute('data-style', '${widget.style}');
  document.head.appendChild(script);
})();
</script>`;

    return {
      widgetId: widget.id,
      style: widget.style,
      embedCode,
      iframeCode: `<iframe src="http://localhost:4000/embed/${widget.id}" width="100%" height="400" frameborder="0"></iframe>`,
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
