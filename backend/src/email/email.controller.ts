import { Controller, Get, Post, Put, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { EmailService } from './email.service';
import { SendEmailDto, UpdateEmailPreferencesDto } from './dto/send-email.dto';

@Controller('api/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.emailService.sendEmail(sendEmailDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getEmailLogs(@Request() req, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.emailService.getEmailLogs(req.user.businessId, limitNum);
  }

  @Get('preferences/:email')
  async getEmailPreferences(@Param('email') email: string) {
    return this.emailService.getEmailPreferences(email);
  }

  @Put('preferences/:email')
  async updateEmailPreferences(
    @Param('email') email: string,
    @Body() updateDto: UpdateEmailPreferencesDto
  ) {
    return this.emailService.updateEmailPreferences(email, updateDto);
  }

  @Post('unsubscribe')
  async unsubscribe(@Body('token') token: string) {
    const success = await this.emailService.unsubscribeByToken(token);
    return { success, message: success ? 'Successfully unsubscribed' : 'Invalid token' };
  }

  // Test endpoints for development
  @UseGuards(JwtAuthGuard)
  @Post('test/welcome')
  async testWelcomeEmail(@Request() req, @Body() data: any) {
    return this.emailService.sendWelcomeEmail(
      data.email,
      data.name,
      req.user.businessId,
      data.businessName || 'Test Business'
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('test/review-notification')
  async testReviewNotification(@Request() req, @Body() data: any) {
    const reviewData = {
      businessName: data.businessName || 'Test Business',
      type: data.type || 'video',
      title: data.title || 'Great service!',
      reviewerName: data.reviewerName || 'John Doe',
      bodyText: data.bodyText || 'Amazing experience with this business!',
      rating: data.rating || 5,
      submittedAt: new Date(),
    };

    return this.emailService.sendReviewNotification(
      data.email,
      data.name,
      req.user.businessId,
      reviewData
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('test/trial-expiring')
  async testTrialExpiringEmail(@Request() req, @Body() data: any) {
    const trialData = {
      businessName: data.businessName || 'Test Business',
      daysLeft: data.daysLeft || 3,
      trialEndDate: new Date(Date.now() + (data.daysLeft || 3) * 24 * 60 * 60 * 1000),
      reviewCount: data.reviewCount || 5,
      viewCount: data.viewCount || 150,
      storageUsed: data.storageUsed || 0.5,
    };

    return this.emailService.sendTrialExpiringEmail(
      data.email,
      data.name,
      req.user.businessId,
      trialData
    );
  }
}
