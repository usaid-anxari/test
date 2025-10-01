import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingTransaction } from './entities/billing-transaction.entity';
import { BillingAccount } from './entities/billing-account.entity';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(BillingTransaction)
    private transactionRepository: Repository<BillingTransaction>,
    @InjectRepository(BillingAccount)
    private billingAccountRepository: Repository<BillingAccount>,
  ) {}

  async getInvoices(businessId: string) {
    const billingAccount = await this.billingAccountRepository.findOne({
      where: { businessId },
    });

    if (!billingAccount) {
      return { invoices: [], total: 0 };
    }

    const transactions = await this.transactionRepository.find({
      where: { billingAccountId: billingAccount.id },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    return {
      invoices: transactions.map(transaction => ({
        id: transaction.id,
        invoiceNumber: `INV-${transaction.id.slice(-8).toUpperCase()}`,
        date: transaction.createdAt,
        amount: transaction.amountCents / 100,
        status: transaction.transactionStatus,
        description: transaction.description || `${billingAccount.pricingTier} Plan`,
      })),
      total: transactions.length,
    };
  }

  async generateInvoicePDF(businessId: string, invoiceId: string): Promise<Buffer> {
    const billingAccount = await this.billingAccountRepository.findOne({
      where: { businessId },
    });

    if (!billingAccount) {
      throw new NotFoundException('Billing account not found');
    }

    const transaction = await this.transactionRepository.findOne({
      where: { id: invoiceId, billingAccountId: billingAccount.id },
    });

    if (!transaction) {
      throw new NotFoundException('Invoice not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).fillColor('#3B82F6').text('TRUETESTIFY', 50, 50);
      doc.fontSize(16).fillColor('#000000').text('INVOICE', 50, 80);

      // Invoice details
      doc.fontSize(12)
         .text(`Invoice #: INV-${transaction.id.slice(-8).toUpperCase()}`, 50, 120)
         .text(`Date: ${transaction.createdAt.toLocaleDateString()}`, 50, 140)
         .text(`Status: ${transaction.transactionStatus.toUpperCase()}`, 50, 160);

      // Business details
      doc.text(`Business ID: ${businessId}`, 50, 200)
         .text(`Plan: ${billingAccount.pricingTier}`, 50, 220)
         .text(`Description: ${transaction.description || `${billingAccount.pricingTier} Plan`}`, 50, 240);

      // Amount
      doc.fontSize(14)
         .text(`Amount: $${(transaction.amountCents / 100).toFixed(2)}`, 50, 280);

      // Footer
      doc.fontSize(10)
         .fillColor('#666666')
         .text('Thank you for your business!', 50, 350)
         .text('TrueTestify Team', 50, 365);

      doc.end();
    });
  }
}