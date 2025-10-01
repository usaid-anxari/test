import { Controller, Get, Param, Res, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/jwt-auth/jwt-auth.guard';
import { BusinessService } from '../business/business.service';
import { InvoiceService } from './invoice.service';

@ApiTags('Invoices')
@Controller('api/billing/invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly businessService: BusinessService,
  ) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Get all invoices for the business' })
  async getInvoices(@Req() req) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('No business found for user');
    }

    return this.invoiceService.getInvoices(business.id);
  }

  @Get(':invoiceId/download')
  @ApiParam({ name: 'invoiceId', description: 'Invoice ID to download' })
  @ApiResponse({ status: 200, description: 'Download invoice PDF', schema: { type: 'string', format: 'binary' } })
  async downloadInvoice(
    @Req() req,
    @Param('invoiceId') invoiceId: string,
    @Res() res: Response,
  ) {
    const userId = req.userEntity.id;
    const business = await this.businessService.findDefaultForUser(userId);
    
    if (!business) {
      throw new BadRequestException('No business found for user');
    }

    const pdfBuffer = await this.invoiceService.generateInvoicePDF(business.id, invoiceId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoiceId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.send(pdfBuffer);
  }
}