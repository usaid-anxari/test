import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { BillingAccount } from './entities/billing-account.entity';
import { BillingTransaction } from './entities/billing-transaction.entity';
import { StorageModule } from '../storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { BusinessModule } from '../business/business.module';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BillingAccount,
      BillingTransaction,
    ]),
    ConfigModule,
    StorageModule,
    AuthModule,
    forwardRef(()=> BusinessModule),
  ],
  providers: [BillingService, InvoiceService, SubscriptionGuard],
  controllers: [BillingController, InvoiceController],
  exports: [BillingService, InvoiceService],
})
export class BillingModule {}
