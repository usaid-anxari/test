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
  Logger,
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
import { memoryStorage } from 'multer';
import { S3Service } from '../common/s3/s3.service';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@ApiTags('Business')
@Controller()
export class BusinessController {
  private readonly logger = new Logger(BusinessController.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly bizService: BusinessService,
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service, // Add S3Service
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('api/business')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('logoFile', {
      storage: memoryStorage(), // Use memory storage instead of multer-s3
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max for logo
      },
      fileFilter: (req, file, cb) => {
        // Only allow image files
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @ApiBody({ type: CreateBusinessDto })
  async createBusiness(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateBusinessDto,
  ) {
    try {
      const slug = (body.slug || body.name).toLowerCase().replace(/\s+/g, '-');

      // Check slug uniqueness
      const existing = await this.bizService.findBySlug(slug);
      if (existing) {
        throw new BadRequestException('Slug already taken, choose another.');
      }

      // Get current user
      const userId = req.userEntity.id;
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found in system.');
      }

      // Handle logo upload (file OR URL)
      let logoUrl = body.logoUrl;
      
      if (file) {
        // Upload logo to S3 using the S3Service
        const timestamp = Date.now();
        const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const s3Key = `businesses/logos/${timestamp}-${safeFilename}`;
        
        // Convert buffer to stream
        const stream = Readable.from(file.buffer);
        
        // Upload to S3
        const uploadResult = await this.s3Service.uploadStream(
          s3Key,
          stream,
          file.size,
          file.mimetype
        );
        
        // Get signed URL for the logo
        logoUrl = await this.s3Service.getSignedUrl(s3Key, 3600 * 24 * 7); // 7 days expiry
        
        this.logger.log(`Logo uploaded to S3: ${s3Key}`);
      }

      // Create business
      const biz = await this.bizService.create({
        name: body.name,
        slug,
        logoUrl,
        brandColor: body.brandColor,
        website: body.website,
        contactEmail: body.contactEmail,
        settingsJson: body.settingsJson || { textReviewsEnabled: true },
      });

      // Attach owner & activate user
      await this.bizService.addOwner(biz.id, user.id, true);
      await this.usersService.updateUserStatus(user.id, true);

      this.logger.log(`Business created: ${biz.id} by user: ${user.id}`);

      return { 
        message: 'Business created successfully', 
        business: {
          id: biz.id,
          name: biz.name,
          slug: biz.slug,
          logoUrl: biz.logoUrl,
          brandColor: biz.brandColor,
          website: biz.website,
          contactEmail: biz.contactEmail,
        }
      };
    } catch (err) {
      this.logger.error('Failed to create business', err);
      
      if (err instanceof BadRequestException) {
        throw err;
      }
      
      throw new BadRequestException('Failed to create business: ' + err.message);
    }
  }

  // Dashboard: return business for current user's default business
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('api/business/me')
  async myBusiness(@Req() req) {
    const userId = req.userEntity.id;
    const b = await this.bizService.findDefaultForUser(userId);
    
    if (!b) {
      return { 
        message: 'No business found. Please create one.',
        business: null 
      };
    }
    
    return { 
      business: {
        id: b.id,
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl,
        brandColor: b.brandColor,
        website: b.website,
        contactEmail: b.contactEmail,
        settingsJson: b.settingsJson,
      }
    };
  }
}