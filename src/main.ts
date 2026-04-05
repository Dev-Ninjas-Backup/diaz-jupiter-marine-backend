import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { ENVEnum } from './common/enum/env.enum';
import { AllExceptionsFilter } from './common/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://development.jupitermarinesales.com',
      'https://jupitermarinesales.com',
      'https://admin.jupitermarinesales.com',
      'https://diaz-jupiter-marine-frontend.vercel.app',
      'https://florida-yacht-dashboard.pages.dev',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // * add global pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // * add global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // * set global prefix before all routes & swagger
  app.setGlobalPrefix('api');

  // * Swagger config with Bearer Auth
  const config = new DocumentBuilder()
    .setTitle('Diaz Jupiter Marine API')
    .setDescription('The Diaz Jupiter Marine Sales API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // * add body parser for raw body routes
  app.use(
    '/api/raw',
    bodyParser.raw({ type: 'application/json' }),
  );

  const port = parseInt(configService.get<string>(ENVEnum.PORT) ?? '5052', 10);
  await app.listen(port);
}

void bootstrap();
