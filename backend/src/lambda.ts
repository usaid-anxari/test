import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { json } from 'express';

import express from 'express';
import serverlessHttp from 'serverless-http';

type ServerlessHandler = (
  event: any,
  context: any
) => Promise<any>;

let cachedServer: ServerlessHandler;

async function bootstrapServer(): Promise<ServerlessHandler> {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter, { 
      rawBody: true,
      logger: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'log'] : ['error', 'warn'],
    });
    
    const configService = app.get(ConfigService);

    // Raw body middleware for Stripe webhooks only
    app.use('/api/billing/webhook', json({ verify: (req: any, res, buf) => { req.rawBody = buf; } }));
    
    // Regular JSON middleware for all other routes
    app.use(json());

    // Enable CORS - Allow all origins for widget functionality
    app.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
    });

    // Swagger configuration (optional for Lambda, can be disabled in production)
    if (configService.get('ENABLE_SWAGGER') !== 'false') {
      const swaggerConfig = new DocumentBuilder()
        .setTitle('Truetestify API')
        .setDescription('MVP APIs for Truetestify')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const doc = SwaggerModule.createDocument(app, swaggerConfig);
      SwaggerModule.setup('api/docs', app, doc);
    }

    await app.init();
    cachedServer = serverlessHttp(expressApp, {
      binary: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    }) as ServerlessHandler;
  }
  
  return cachedServer;
}

export const handler = async (
  event: any,
  context: any,
): Promise<any> => {
  // Set Lambda context for proper timeout handling
  context.callbackWaitsForEmptyEventLoop = false;
  
  const server = await bootstrapServer();
  return await server(event, context);
};

