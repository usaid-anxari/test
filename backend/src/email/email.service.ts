import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { EmailLog, EmailType, EmailStatus } from './entities/email-log.entity';
import { EmailPreference } from './entities/email-preference.entity';
import { SendEmailDto, UpdateEmailPreferencesDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(EmailLog)
    private emailLogRepository: Repository<EmailLog>,
    @InjectRepository(EmailPreference)
    private emailPreferenceRepository: Repository<EmailPreference>,
    private configService: ConfigService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpUser = this.configService.get('SMTP_USER');
    
    if (isProduction && smtpHost && smtpUser) {
      // Production: Use AWS SES or configured SMTP
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(this.configService.get('SMTP_PORT') || '587'),
        secure: false,
        auth: {
          user: smtpUser,
          pass: this.configService.get('SMTP_PASS'),
        },
      });
    } else {
      // Development: Use Ethereal Email (fake SMTP)
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }
  }

  async sendEmail(sendEmailDto: SendEmailDto): Promise<EmailLog> {
    // Check email preferences
    if (sendEmailDto.businessId) {
      const canSend = await this.canSendEmail(sendEmailDto.recipientEmail, sendEmailDto.emailType);
      if (!canSend) {
        throw new Error('User has unsubscribed from this type of email');
      }
    }

    // Create email log entry
    const emailLog = this.emailLogRepository.create({
      businessId: sendEmailDto.businessId,
      recipientEmail: sendEmailDto.recipientEmail,
      recipientName: sendEmailDto.recipientName,
      emailType: sendEmailDto.emailType,
      subject: this.getSubjectForEmailType(sendEmailDto.emailType, sendEmailDto.templateData),
      templateData: sendEmailDto.templateData,
      status: EmailStatus.PENDING,
    });

    const savedEmailLog = await this.emailLogRepository.save(emailLog);

    try {
      // Generate email content
      const { subject, html } = await this.generateEmailContent(
        sendEmailDto.emailType,
        sendEmailDto.templateData || {},
        sendEmailDto.recipientEmail
      );

      // Send email (simulated for MVP)
      const info = await this.simulateEmailSend({
        to: sendEmailDto.recipientEmail,
        subject,
        html,
      });

      // Update email log as sent
      savedEmailLog.status = EmailStatus.SENT;
      savedEmailLog.sentAt = new Date();
      await this.emailLogRepository.save(savedEmailLog);

      return savedEmailLog;
    } catch (error) {
      // Update email log as failed
      savedEmailLog.status = EmailStatus.FAILED;
      savedEmailLog.errorMessage = error.message;
      savedEmailLog.retryCount += 1;
      await this.emailLogRepository.save(savedEmailLog);
      throw error;
    }
  }

  private async simulateEmailSend(mailOptions: any): Promise<any> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const smtpHost = this.configService.get('SMTP_HOST');
    
    if (isProduction && smtpHost) {
      // Production: Actually send email
      return await this.transporter.sendMail({
        from: this.configService.get('FROM_EMAIL') || 'noreply@truetestify.com',
        ...mailOptions,
      });
    } else {
      // Development: Simulate email sending
      console.log('📧 Email sent (simulated):');
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log('✅ Email delivery simulated successfully');
      
      return {
        messageId: `simulated-${Date.now()}@truetestify.com`,
        accepted: [mailOptions.to],
        rejected: []
      };
    }
  }

  private async generateEmailContent(
    emailType: EmailType,
    templateData: Record<string, any>,
    recipientEmail: string
  ): Promise<{ subject: string; html: string }> {
    const templatePath = path.join(__dirname, 'templates', `${emailType.replace('_', '-')}.html`);
    
    let html = '';
    try {
      html = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      // Fallback to basic template
      html = this.getBasicTemplate(emailType, templateData);
    }

    // Replace template variables
    const unsubscribeToken = await this.generateUnsubscribeToken(recipientEmail);
    const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
    
    const allTemplateData = {
      ...templateData,
      unsubscribeUrl: `${baseUrl}/unsubscribe?token=${unsubscribeToken}`,
      dashboardUrl: `${baseUrl}/dashboard`,
      helpUrl: `${baseUrl}/help`,
      pricingUrl: `${baseUrl}/pricing`,
    };

    // Simple template replacement
    Object.keys(allTemplateData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, allTemplateData[key] || '');
    });

    const subject = this.getSubjectForEmailType(emailType, templateData);
    return { subject, html };
  }

  private getSubjectForEmailType(emailType: EmailType, templateData?: Record<string, any>): string {
    switch (emailType) {
      case EmailType.WELCOME:
        return `Welcome to TrueTestify, ${templateData?.recipientName || 'there'}!`;
      case EmailType.REVIEW_NOTIFICATION:
        return `New ${templateData?.reviewType || 'review'} review received!`;
      case EmailType.TRIAL_EXPIRING:
        return `Your TrueTestify trial expires in ${templateData?.daysLeft || 'a few'} days`;
      case EmailType.PAYMENT_CONFIRMATION:
        return 'Payment confirmation - TrueTestify';
      case EmailType.PAYMENT_FAILED:
        return 'Payment failed - Action required';
      case EmailType.STORAGE_WARNING:
        return 'Storage limit warning - TrueTestify';
      case EmailType.FEATURE_UPDATE:
        return 'New features available - TrueTestify';
      case EmailType.PASSWORD_RESET:
        return 'Reset your TrueTestify password';
      default:
        return 'TrueTestify Notification';
    }
  }

  private getBasicTemplate(emailType: EmailType, templateData: Record<string, any>): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>TrueTestify Notification</h2>
            <p>Hi ${templateData.recipientName || 'there'},</p>
            <p>This is a notification from TrueTestify.</p>
            <p>Email Type: ${emailType}</p>
            <hr>
            <p><small>TrueTestify - Building trust through authentic video testimonials</small></p>
            <p><small><a href="{{unsubscribeUrl}}">Unsubscribe</a></small></p>
          </div>
        </body>
      </html>
    `;
  }

  async getEmailPreferences(email: string): Promise<EmailPreference> {
    let preferences = await this.emailPreferenceRepository.findOne({ where: { email } });
    
    if (!preferences) {
      preferences = this.emailPreferenceRepository.create({
        email,
        reviewNotifications: true,
        billingNotifications: true,
        marketingEmails: true,
        featureUpdates: true,
        unsubscribeToken: this.generateRandomToken(),
      });
      preferences = await this.emailPreferenceRepository.save(preferences);
    }

    return preferences;
  }

  async updateEmailPreferences(
    email: string,
    updateDto: UpdateEmailPreferencesDto
  ): Promise<EmailPreference> {
    const preferences = await this.getEmailPreferences(email);
    
    Object.assign(preferences, updateDto);
    return this.emailPreferenceRepository.save(preferences);
  }

  async unsubscribeByToken(token: string): Promise<boolean> {
    const preferences = await this.emailPreferenceRepository.findOne({
      where: { unsubscribeToken: token }
    });

    if (preferences) {
      preferences.unsubscribedAt = new Date();
      preferences.reviewNotifications = false;
      preferences.billingNotifications = false;
      preferences.marketingEmails = false;
      preferences.featureUpdates = false;
      await this.emailPreferenceRepository.save(preferences);
      return true;
    }

    return false;
  }

  private async canSendEmail(email: string, emailType: EmailType): Promise<boolean> {
    const preferences = await this.getEmailPreferences(email);
    
    if (preferences.unsubscribedAt) {
      return false;
    }

    switch (emailType) {
      case EmailType.REVIEW_NOTIFICATION:
        return preferences.reviewNotifications;
      case EmailType.PAYMENT_CONFIRMATION:
      case EmailType.PAYMENT_FAILED:
      case EmailType.TRIAL_EXPIRING:
        return preferences.billingNotifications;
      case EmailType.FEATURE_UPDATE:
        return preferences.featureUpdates;
      case EmailType.WELCOME:
      case EmailType.PASSWORD_RESET:
        return true; // Always send critical emails
      default:
        return preferences.marketingEmails;
    }
  }

  private async generateUnsubscribeToken(email: string): Promise<string> {
    const preferences = await this.getEmailPreferences(email);
    return preferences.unsubscribeToken;
  }

  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async getEmailLogs(businessId: string, limit: number = 50): Promise<EmailLog[]> {
    return this.emailLogRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Convenience methods for common email types
  async sendWelcomeEmail(recipientEmail: string, recipientName: string, businessId: string, businessName: string) {
    return this.sendEmail({
      recipientEmail,
      recipientName,
      emailType: EmailType.WELCOME,
      businessId,
      templateData: {
        recipientName,
        businessName,
      },
    });
  }

  async sendReviewNotification(
    recipientEmail: string,
    recipientName: string,
    businessId: string,
    reviewData: any
  ) {
    const starsDisplay = '★'.repeat(reviewData.rating) + '☆'.repeat(5 - reviewData.rating);
    
    return this.sendEmail({
      recipientEmail,
      recipientName,
      emailType: EmailType.REVIEW_NOTIFICATION,
      businessId,
      templateData: {
        recipientName,
        businessName: reviewData.businessName,
        reviewType: reviewData.type,
        reviewTitle: reviewData.title,
        reviewerName: reviewData.reviewerName,
        reviewText: reviewData.bodyText || 'Video/Audio review',
        starsDisplay,
        submittedAt: new Date(reviewData.submittedAt).toLocaleDateString(),
        moderationUrl: `${this.configService.get('FRONTEND_URL')}/dashboard/reviews`,
      },
    });
  }

  async sendTrialExpiringEmail(
    recipientEmail: string,
    recipientName: string,
    businessId: string,
    trialData: any
  ) {
    return this.sendEmail({
      recipientEmail,
      recipientName,
      emailType: EmailType.TRIAL_EXPIRING,
      businessId,
      templateData: {
        recipientName,
        businessName: trialData.businessName,
        daysLeft: trialData.daysLeft,
        trialEndDate: new Date(trialData.trialEndDate).toLocaleDateString(),
        reviewCount: trialData.reviewCount || 0,
        viewCount: trialData.viewCount || 0,
        storageUsed: trialData.storageUsed || 0,
        upgradeUrl: `${this.configService.get('FRONTEND_URL')}/billing/upgrade?plan=starter`,
      },
    });
  }
}
