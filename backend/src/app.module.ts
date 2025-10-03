import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { BusinessModule } from './business/business.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { ReviewsModule } from './review/review.module';
import { UploadsModule } from './uploads/uploads.module';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
// import { TranscodeModule } from './transcode/transcode.module'; // Removed - not used in MVP
import { AdminModule } from './admin/admin.module';
// import { StorageModule } from './storage/storage.module'; // Removed - simple storage tracking in billing
// import { GoogleModule } from './google/google.module'; // Removed - not needed for MVP
import { WidgetsModule } from './widgets/widgets.module';
import { EmbedController } from './embed/embed.controller';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
// import { EmailModule } from './email/email.module'; // Removed - using Auth0 email verification
// import { SubscriptionStatusMiddleware } from './common/middleware/subscription-status.middleware'; // Removed for performance


@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService : ConfigService) => ({
        type: 'postgres',
        host: configService.get("DB_HOST"),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get("DB_PASSWORD"),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
        logging: false, // Disabled for performance
      }),
    }),
    UsersModule,
    BusinessModule,
    AuthModule,
    ReviewsModule,
    UploadsModule,
    // TranscodeModule, // Removed - not used in MVP
    AdminModule,
    // StorageModule, // Removed - simple storage tracking in billing
    // GoogleModule, // Removed - not needed for MVP
    WidgetsModule,
    AnalyticsModule,
    BillingModule,
    // EmailModule, // Removed - using Auth0 email verification
  ],
  controllers: [AppController, EmbedController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Removed subscription middleware - was causing 200-500ms delay on every request
    // Apply only to specific billing routes if needed
  }
}
