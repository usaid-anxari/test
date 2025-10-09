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

  // Test endpoints removed for production performance
}
