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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UsersService } from 'src/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from '../aws.module';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config()

@ApiTags('Business')
@Controller()
export class BusinessController {
  constructor(
    private readonly configService: ConfigService,
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
  // Create business (authenticated user becomes owner and gets activated)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('api/business')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('logoFile', {
      storage: multerS3({
        s3: s3Client, 
        bucket: process.env.AWS_S3_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `logos/${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiBody({ type: CreateBusinessDto })
  async createBusiness(
    @Req() req,
    @UploadedFile() file: any,
    @Body() body: CreateBusinessDto,
  ) {
    try {
      const slug = (body.slug || body.name).toLowerCase().replace(/\s+/g, '-');

      // Check slug
      const existing = await this.bizService.findBySlug(slug);
      if (existing)
        throw new BadRequestException('Slug already taken, choose another.');

      // Get current user
      const auth0Id = req.userEntity.id;
      const user = await this.usersService.findById(auth0Id);
      if (!user) throw new BadRequestException('User not found in system.');

      // Handle logo (file OR URL)
      let logoUrl = body.logoUrl;
      if (file) {
        logoUrl = file.location; // multer-s3 returns the public URL
      }

      // Create business
      const biz = await this.bizService.create({
        name: body.name,
        slug,
        logoUrl,
        brandColor: body.brandColor,
        website: body.website,
        contactEmail: body.contactEmail,
        settingsJson: body.settingsJson || {},
      });

      // Attach owner & activate user
      await this.bizService.addOwner(biz.id, user.id, true);
      await this.usersService.updateUserStatus(user.id, true);

      return { message: 'Business created successfully', business: biz };
    } catch (err) {
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
