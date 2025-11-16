import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
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
      useFactory: (configService: ConfigService) => {
        const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
        const isProduction = configService.get('NODE_ENV') === 'production';
        const isRDS = configService.get('DB_HOST')?.includes('.rds.amazonaws.com');
        
        // Lambda-optimized connection pool (smaller pool, faster timeouts)
        const lambdaPoolConfig = {
          max: 2, // Smaller pool for Lambda (each instance gets its own)
          min: 1,
          acquire: 10000,
          idle: 5000,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
          statement_timeout: 10000,
          query_timeout: 10000,
        };

        // Traditional server pool config (local development)
        const serverPoolConfig = {
          max: 10,
          min: 2,
          acquire: 10000,
          idle: 10000,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
          statement_timeout: 10000,
          query_timeout: 10000,
        };

        // SSL configuration for RDS (at root level, not in extra)
        const sslConfig = isRDS ? {
          ssl: {
            rejectUnauthorized: false, // RDS uses AWS-managed certificates
          },
        } : {};

        const dbHost = configService.get("DB_HOST");
        const dbPort = +configService.get('DB_PORT') || 5432;
        const dbUsername = configService.get('DB_USERNAME');
        const dbPassword = configService.get("DB_PASSWORD");
        const dbName = configService.get('DB_NAME');
        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: !isProduction && !isLambda, // CRITICAL: Never use true in production/Lambda
          autoLoadEntities: true,
          logging: configService.get('NODE_ENV') === 'development' ? ['error', 'warn', 'query'] : false,

          // Connection pool: Lambda uses smaller pools, servers use larger
          extra: isLambda ? lambdaPoolConfig : serverPoolConfig,

          // SSL configuration for RDS
          ...sslConfig,

          // Query optimization
          cache: {
            duration: 30000, // 30 seconds default cache
          },

          // Connection optimization
          keepConnectionAlive: !isLambda, // Lambda should close connections between invocations
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
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
export class AppModule {}
