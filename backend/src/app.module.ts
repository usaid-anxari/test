import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import compression from 'compression';
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
import { SubscriptionStatusMiddleware } from './common/middleware/subscription-status.middleware';
import { AdminModule } from './admin/admin.module';
import { WidgetsModule } from './widgets/widgets.module';
import { EmbedController } from './embed/embed.controller';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
import { GoogleModule } from './google/google.module';
import { ValidationModule } from './validation/validation.module';


@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get("DB_HOST"),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get("DB_PASSWORD"),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // CRITICAL: Never use true in production
        autoLoadEntities: true,
        logging: configService.get('NODE_ENV') === 'development' ? ['error', 'warn'] : false,

        // PERFORMANCE OPTIMIZATIONS
        extra: {
          max: 20, // Connection pool size
          min: 5,
          acquire: 30000,
          idle: 10000,
          connectionTimeoutMillis: 2000,
          idleTimeoutMillis: 30000,
          statement_timeout: 30000,
          query_timeout: 30000,
        },

        // Query optimization
        cache: {
          duration: 30000, // 30 seconds default cache
        },

        // Connection optimization
        keepConnectionAlive: true,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }),
    UsersModule,
    BusinessModule,
    AuthModule,
    ReviewsModule,
    UploadsModule,
    AdminModule,
    WidgetsModule,
    AnalyticsModule,
    BillingModule,
    GoogleModule,
    ValidationModule,
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
    consumer.apply(compression()).forRoutes('*');
    consumer.apply(SubscriptionStatusMiddleware).forRoutes('api/*');
  }
}
