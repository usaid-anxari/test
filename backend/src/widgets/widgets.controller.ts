import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WidgetsService } from './widgets.service';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { RequireFeature, RequireStarterPlan } from '../common/decorators/subscription.decorator';
import { BusinessService } from '../business/business.service';
import { CreateWidgetDto } from './dto/create-widget.dto';

@ApiTags('Widgets')
@Controller('api/widgets')
export class WidgetsController {
  constructor(
    private readonly widgetsService: WidgetsService,
    private readonly businessService: BusinessService,
  ) {}

  // Milestone 7: Create widget
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiBody({ type: CreateWidgetDto })
  @ApiResponse({ status: 201, description: 'Widget created successfully' })
  async createWidget(@Req() req, @Body() body: CreateWidgetDto) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const widget = await this.widgetsService.createWidget(business.id, body);
    
    return {
      message: 'Widget created successfully',
      widget: {
        id: widget.id,
        name: widget.name,
        style: widget.style,
        isActive: widget.isActive,
        createdAt: widget.createdAt,
      },
    };
  }

  // Get all widgets for business
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiResponse({ status: 200, description: 'List of widgets' })
  async getWidgets(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const widgets = await this.widgetsService.getWidgets(business.id);
    
    return {
      widgets: widgets.map(widget => ({
        id: widget.id,
        name: widget.name,
        style: widget.style,
        isActive: widget.isActive,
        settingsJson: widget.settingsJson,
        createdAt: widget.createdAt,
        updatedAt: widget.updatedAt,
      })),
    };
  }

  // Get widget embed code
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireStarterPlan()
  @ApiBearerAuth()
  @Get(':id/embed-code')
  @ApiResponse({ status: 200, description: 'Widget embed code' })
  async getEmbedCode(@Req() req, @Param('id') widgetId: string) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const embedData = await this.widgetsService.generateEmbedCode(business.id, widgetId);
    return embedData;
  }

  // Update widget
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiBody({ type: CreateWidgetDto })
  @ApiResponse({ status: 200, description: 'Widget updated successfully' })
  async updateWidget(
    @Req() req,
    @Param('id') widgetId: string,
    @Body() body: Partial<CreateWidgetDto & { isActive?: boolean }>
  ) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const widget = await this.widgetsService.updateWidget(business.id, widgetId, body);
    
    return {
      message: 'Widget updated successfully',
      widget: {
        id: widget.id,
        name: widget.name,
        style: widget.style,
        settings: widget.settingsJson,
        isActive: widget.isActive,
        updatedAt: widget.updatedAt,
      },
    };
  }

  // Delete widget
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Widget deleted successfully' })
  async deleteWidget(@Req() req, @Param('id') widgetId: string) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('Business not found');
    }

    const result = await this.widgetsService.deleteWidget(business.id, widgetId);
    return result;
  }
}
