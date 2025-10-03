import {
  Controller,
  Get,
  Post,
  Put,
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
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { RequireEnterprisePlan, RequireFeature, RequireProfessionalPlan } from '../common/decorators/subscription.decorator';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UsersService } from 'src/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Service } from '../common/s3/s3.service';
import { Readable } from 'stream';

@ApiTags('Business')
@Controller()
export class BusinessController {
  private readonly logger = new Logger(BusinessController.name);
  
  constructor(
    private readonly bizService: BusinessService,
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service, // Add S3Service
  ) {}

  // Public page: truetestify.com/{business-slug} - Milestone 4
  @Get('business/:slug')
  @ApiResponse({ 
    status: 200, 
    description: 'Business profile with prioritized approved reviews (video → audio → text) - S3 keys only' 
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async publicProfile(@Param('slug') slug: string) {
    const result = await this.bizService.getPublicProfileWithReviews(slug);
    if (!result) throw new NotFoundException('Business not found');
    
    return result;
  }

  // Public reviews endpoint - Milestone 4
  @Get('business/:slug/reviews')
  @ApiResponse({ 
    status: 200, 
    description: 'Approved reviews only, prioritized by type with S3 keys' 
  })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getPublicReviews(@Param('slug') slug: string) {
    const result = await this.bizService.getPublicProfileWithReviews(slug);
    if (!result) throw new NotFoundException('Business not found');
    
    return {
      reviews: result.reviews,
      stats: result.stats,
    };
  }

  // Create business (authenticated user becomes owner and gets activated)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('api/business')
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 201, 
    description: 'Business created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Business created successfully' },
        business: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'My Business' },
            slug: { type: 'string', example: 'my-business' },
            description: { type: 'string', example: 'Business description' },
            industry: { type: 'string', example: 'Technology' },
            website: { type: 'string', example: 'https://mybusiness.com' },
            contactEmail: { type: 'string', example: 'contact@mybusiness.com' },
            phone: { type: 'string', example: '+1234567890' },
            address: { type: 'string', example: '123 Main St' },
            city: { type: 'string', example: 'New York' },
            state: { type: 'string', example: 'NY' },
            country: { type: 'string', example: 'USA' },
            postalCode: { type: 'string', example: '10001' },
            companySize: { type: 'string', example: '1-10 employees' },
            foundedYear: { type: 'number', example: 2020 },
            logoUrl: { type: 'string', example: 'https://s3.amazonaws.com/logo.png' },
            bannerUrl: { type: 'string', example: 'https://s3.amazonaws.com/banner.png' },
            brandColor: { type: 'string', example: '#ef7c00' },
            businessHours: { type: 'object' },
            socialLinks: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed or slug already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid JWT token' })
  @ApiBody({
    description: 'Business creation data with optional logo file',
    schema: {
      type: 'object',
      properties: {
        logoFile: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (max 5MB)'
        },
        slug: { type: 'string', example: 'my-business', description: 'Unique URL slug' },
        name: { type: 'string', example: 'My Business', description: 'Business name' },
        description: { type: 'string', example: 'We provide excellent services', description: 'Business description' },
        industry: { type: 'string', example: 'Technology', description: 'Business industry' },
        website: { type: 'string', example: 'https://mybusiness.com', description: 'Business website' },
        contactEmail: { type: 'string', example: 'contact@mybusiness.com', description: 'Contact email' },
        phone: { type: 'string', example: '+1234567890', description: 'Phone number' },
        address: { type: 'string', example: '123 Main St', description: 'Street address' },
        city: { type: 'string', example: 'New York', description: 'City' },
        state: { type: 'string', example: 'NY', description: 'State/Province' },
        country: { type: 'string', example: 'USA', description: 'Country' },
        postalCode: { type: 'string', example: '10001', description: 'Postal/ZIP code' },
        companySize: { type: 'string', example: '1-10 employees', description: 'Company size' },
        foundedYear: { type: 'number', example: 2020, description: 'Year founded' },
        brandColor: { type: 'string', example: '#ef7c00', description: 'Brand color (hex)' },
        bannerUrl: { type: 'string', example: 'https://example.com/banner.jpg', description: 'Banner image URL' },
        businessHours: { 
          type: 'object', 
          example: { monday: '9:00-17:00', tuesday: '9:00-17:00' },
          description: 'Business operating hours'
        },
        socialLinks: { 
          type: 'object', 
          example: { facebook: 'https://facebook.com/mybusiness', twitter: 'https://twitter.com/mybusiness' },
          description: 'Social media links'
        }
      },
      required: ['slug', 'name']
    }
  })
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
  async createBusiness(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateBusinessDto,
  ) {
    try {
      const userId = req.userEntity.id;
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found in system.');
      }

      // Check if user already has a business (one business per user)
      const hasExisting = await this.bizService.hasExistingBusiness(userId);
      if (hasExisting) {
        throw new BadRequestException('User already has a business. Only one business per user is allowed.');
      }

      // Validate email matches Auth0 email
      if (body.contactEmail && body.contactEmail !== user.email) {
        throw new BadRequestException('Contact email must match your account email.');
      }

      const slug = (body.slug || body.name).toLowerCase().replace(/\s+/g, '-');

      // Check slug uniqueness
      const existing = await this.bizService.findBySlug(slug);
      if (existing) {
        throw new BadRequestException('Slug already taken, choose another.');
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

      // Create business with comprehensive info
      const biz = await this.bizService.create({
        name: body.name,
        slug,
        description: body.description,
        industry: body.industry,
        website: body.website,
        contactEmail: body.contactEmail,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        postalCode: body.postalCode,
        companySize: body.companySize,
        foundedYear: body.foundedYear,
        logoUrl,
        bannerUrl: body.bannerUrl,
        brandColor: body.brandColor || '#ef7c00',
        businessHours: body.businessHours,
        socialLinks: body.socialLinks,
        settingsJson: body.settingsJson || { textReviewsEnabled: true },
      });

      // Auto-verify if profile is complete
      await this.bizService.checkAndAutoVerify(biz.id);

      // Attach owner & activate user
      await this.bizService.addOwner(biz.id, user.id, true);
      await this.usersService.updateUserStatus(user.id, true);

      this.logger.log(`Business created: ${biz.id} by user: ${user.id}`);

      // Get final business with verification status
      const finalBusiness = await this.bizService.findById(biz.id);
      
      return { 
        message: 'Business created successfully', 
        business: finalBusiness
      };
    } catch (err) {
      this.logger.error('Failed to create business', err);
      
      if (err instanceof BadRequestException) {
        throw err;
      }
      
      throw new BadRequestException('Failed to create business: ' + err.message);
    }
  }

  // Dashboard: return business for current user's default business with all reviews
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('api/business/me')
  async myBusiness(@Req() req) {
    const userId = req.userEntity.id;
    const b = await this.bizService.findDefaultForUser(userId);
    
    if (!b) {
      return { 
        message: 'No business found. Please create one.',
        business: null,
        reviews: []
      };
    }
    
    // Get all reviews for this business (not just approved)
    const allReviews = await this.bizService.getAllReviewsForBusiness(b.id);
    
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
        createdAt : b.createdAt
      },
      reviews: allReviews
    };
  }

  // Update business information (excluding slug)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('api/business/me')
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 200, 
    description: 'Business updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Business updated successfully' },
        business: {
          type: 'object',
          description: 'Updated business object with all fields'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid JWT token' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  @ApiBody({
    description: 'Business update data with optional logo file (slug cannot be updated)',
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Logo image file (max 5MB)'
        },
        name: { type: 'string', example: 'Updated Business Name', description: 'Business name' },
        description: { type: 'string', example: 'Updated business description', description: 'Business description' },
        industry: { type: 'string', example: 'Updated Industry', description: 'Business industry' },
        website: { type: 'string', example: 'https://updated-website.com', description: 'Business website' },
        contactEmail: { type: 'string', example: 'updated@business.com', description: 'Contact email' },
        phone: { type: 'string', example: '+1987654321', description: 'Phone number' },
        address: { type: 'string', example: '456 Updated St', description: 'Street address' },
        city: { type: 'string', example: 'Updated City', description: 'City' },
        state: { type: 'string', example: 'CA', description: 'State/Province' },
        country: { type: 'string', example: 'USA', description: 'Country' },
        postalCode: { type: 'string', example: '90210', description: 'Postal/ZIP code' },
        companySize: { type: 'string', example: '11-50 employees', description: 'Company size' },
        foundedYear: { type: 'number', example: 2019, description: 'Year founded' },
        brandColor: { type: 'string', example: '#3b82f6', description: 'Brand color (hex)' },
        bannerUrl: { type: 'string', example: 'https://example.com/new-banner.jpg', description: 'Banner image URL' },
        businessHours: { 
          type: 'object', 
          example: { monday: '8:00-18:00', tuesday: '8:00-18:00' },
          description: 'Business operating hours'
        },
        socialLinks: { 
          type: 'object', 
          example: { facebook: 'https://facebook.com/updated', linkedin: 'https://linkedin.com/company/updated' },
          description: 'Social media links'
        }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max for logo
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async updateMyBusiness(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateBusinessDto,
  ) {
    const userId = req.userEntity.id;
    const business = await this.bizService.findDefaultForUser(userId);
    
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const updateData: any = {};
    
    // Update all allowed fields (excluding slug)
    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.industry) updateData.industry = body.industry;
    if (body.website) updateData.website = body.website;
    if (body.contactEmail) updateData.contactEmail = body.contactEmail;
    if (body.phone) updateData.phone = body.phone;
    if (body.address) updateData.address = body.address;
    if (body.city) updateData.city = body.city;
    if (body.state) updateData.state = body.state;
    if (body.country) updateData.country = body.country;
    if (body.postalCode) updateData.postalCode = body.postalCode;
    if (body.companySize) updateData.companySize = body.companySize;
    if (body.foundedYear) updateData.foundedYear = body.foundedYear;
    if (body.brandColor) updateData.brandColor = body.brandColor;
    if (body.businessHours) updateData.businessHours = body.businessHours;
    if (body.socialLinks) updateData.socialLinks = body.socialLinks;
    if (body.bannerUrl) updateData.bannerUrl = body.bannerUrl;

    // Handle logo upload if provided
    if (file) {
      const timestamp = Date.now();
      const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const s3Key = `businesses/logos/${timestamp}-${safeFilename}`;
      
      const stream = Readable.from(file.buffer);
      
      await this.s3Service.uploadStream(
        s3Key,
        stream,
        file.size,
        file.mimetype
      );
      
      updateData.logoUrl = await this.s3Service.getSignedUrl(s3Key, 3600 * 24 * 7);
      
      this.logger.log(`Logo updated for business: ${business.id}`);
    }

    // Update business (slug is intentionally excluded from updateData)
    const updatedBusiness = await this.bizService.updateBusiness(business.id, updateData);
    
    // Auto-verify business if profile is complete
    await this.bizService.checkAndAutoVerify(updatedBusiness.id);
    
    // Get updated business with verification status
    const finalBusiness = await this.bizService.findById(updatedBusiness.id);
    
    return {
      message: 'Business updated successfully',
      business: finalBusiness
    };
  }

  //  Toggle text reviews setting
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireFeature(['priority_support'])
  @ApiBearerAuth()
  @Post('api/business/settings/text-reviews')
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        enabled: { type: 'boolean' } 
      } 
    } 
  })
  async toggleTextReviews(@Req() req, @Body() body: { enabled: boolean }) {
    const userId = req.userEntity.id;
    const business = await this.bizService.findDefaultForUser(userId);
    
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    
    await this.bizService.updateBusinessSettings(
      business.id,
      userId,
      { textReviewsEnabled: body.enabled }
    );
    
    return {
      message: `Text reviews ${body.enabled ? 'enabled' : 'disabled'}`,
      textReviewsEnabled: body.enabled
    };
  }

  //  Toggle Google reviews setting
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireFeature(['priority_support'])
  @RequireProfessionalPlan()
  @ApiBearerAuth()
  @Post('api/business/settings/google-reviews')
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        enabled: { type: 'boolean' } 
      } 
    } 
  })
  async toggleGoogleReviews(@Req() req, @Body() body: { enabled: boolean }) {
    const userId = req.userEntity.id;
    const business = await this.bizService.findDefaultForUser(userId);
    
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    
     await this.bizService.updateBusinessSettings(
      business.id,
      userId,
      { googleReviewsEnabled: body.enabled }
    );
    
    return {
      message: `Google reviews ${body.enabled ? 'enabled' : 'disabled'}`,
      googleReviewsEnabled: body.enabled
    };
  }
}