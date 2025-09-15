import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UsersService } from 'src/users/users.service';

@ApiTags('Business')
@Controller()
export class BusinessController {
  constructor(
    private readonly bizService: BusinessService,
    private readonly usersService: UsersService,
  ) {}

  // Public page: truetestify.com/{business-slug}
  @Get('business/:slug')
  async publicProfile(@Param('slug') slug: string) {
    const b = await this.bizService.findBySlug(slug);
    if (!b) throw new NotFoundException('Business not found');
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      brandColor: b.brandColor,
      website: b.website,
      contactEmail: b.contactEmail,
      emptyState: 'No reviews yet.',
    };
  }

  // Create business (authenticated user becomes owner and gets activated)
  // Create business — authenticated user
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('api/business')
  @ApiBody({ type: CreateBusinessDto })
  async createBusiness(@Req() req, @Body() body: CreateBusinessDto) {
    try {
      const slug = (body.slug || body.name).toLowerCase().replace(/\s+/g, '-');

      // Check if slug already exists
      const existing = await this.bizService.findBySlug(slug);
      if (existing) {
        throw new BadRequestException('Slug already taken, choose another.');
      }

      // Create business
      const biz = await this.bizService.create({
        name: body.name,
        slug,
        logoUrl: body.logoUrl,
        brandColor: body.brandColor,
        website: body.website,
        contactEmail: body.contactEmail,
        settingsJson: body.settingsJson || {},
      });

      // Attach owner & activate user
      await this.bizService.addOwner(biz.id, req.user.id, true);
      await req.userRepo.update(req.user.id, { isActive: true }); // activate user

      return { message: 'Business created successfully', business: biz };
    } catch (err) {
      console.error('Business creation error:', err);
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Failed to create business');
    }
  }

  // Dashboard: return business for current user's default business
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('api/business/me')
  async myBusiness(@Req() req) {
    const user = req.userEntity;
    const b = await this.bizService.findDefaultForUser(user.id);
    if (!b) return { message: 'No business for this user (create one).' };
    return { business: b };
  }
}
