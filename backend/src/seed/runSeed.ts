import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { seed } from './seed';

// Import all entities
import { User } from '../users/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { BusinessUser } from '../business/entities/business-user.entity';
import { Review } from '../review/entities/review.entity';
import { MediaAsset } from '../review/entities/media-asset.entity';
import { TranscodeJob } from '../review/entities/transcode-job.entity';
import { GoogleConnection } from '../google/entities/google-connection.entity';
import { GoogleReview } from '../google/entities/google-review.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { EmbedToken } from '../widgets/entities/embed-token.entity';
import { BillingAccount } from '../billing/entities/billing-account.entity';
import { BillingTransaction } from '../billing/entities/billing-transaction.entity';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';
import { EmailLog } from '../email/entities/email-log.entity';
import { EmailPreference } from '../email/entities/email-preference.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Business,
    BusinessUser,
    Review,
    MediaAsset,
    TranscodeJob,
    GoogleConnection,
    GoogleReview,
    Widget,
    EmbedToken,
    BillingAccount,
    BillingTransaction,
    AnalyticsEvent,
    EmailLog,
    EmailPreference,
  ],
  synchronize: true,
  logging: false,
});

async function runSeed() {
  try {
    console.log('🚀 Initializing database connection...');
    await dataSource.initialize();
    
    console.log('🌱 Running comprehensive seed...');
    await seed(dataSource);
    
    console.log('\n🎉 Seed completed successfully!');
    console.log('\n🔗 Ready to test all endpoints:');
    console.log('   Public: GET /business/truetestify');
    console.log('   Public: GET /api/billing/pricing-plans');
    console.log('   Public: POST /api/public/truetestify/reviews');
    console.log('   Public: GET /embed/truetestify?style=grid');
    console.log('   Public: POST /api/analytics/events');
    console.log('   Auth: GET /auth/profile (with Auth0 token)');
    console.log('   Auth: GET /api/business/me (with Auth0 token)');
    console.log('   Auth: GET /api/reviews (with Auth0 token)');
    console.log('   Auth: GET /api/analytics/dashboard (with Auth0 token)');
    console.log('   Auth: GET /api/billing/account (with Auth0 token)');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

runSeed();