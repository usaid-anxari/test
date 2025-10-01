import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { BusinessModule } from './business/business.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { ReviewsModule } from './review/review.module';
import { UploadsModule } from './uploads/uploads.module';
import { TranscodeModule } from './transcode/transcode.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { GoogleModule } from './google/google.module';
import { WidgetsModule } from './widgets/widgets.module';
import { EmbedController } from './embed/embed.controller';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
import { EmailModule } from './email/email.module';
import { SubscriptionStatusMiddleware } from './common/middleware/subscription-status.middleware';


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
        logging: true,
      }),
    }),
    UsersModule,
    BusinessModule,
    AuthModule,
    ReviewsModule,
    UploadsModule,
    TranscodeModule,
    AdminModule,
    StorageModule,
    GoogleModule,
    WidgetsModule,
    AnalyticsModule,
    BillingModule,
    EmailModule
  ],
  controllers: [AppController, EmbedController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SubscriptionStatusMiddleware)
      .forRoutes('*');
  }
}
