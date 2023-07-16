import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import otelSDK from './otel';
import { AppModule } from './app.module';

async function bootstrap() {
  await otelSDK.start();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useStaticAssets(join(__dirname, 'static'));

  const configService = app.get(ConfigService);

  // Setup CORS
  const allowedOrigins = configService.get<string[]>('cors.allowedOrigins');
  const allowedMethods = configService.get<string[]>('cors.allowedMethods');
  if (allowedOrigins && allowedOrigins.length > 0) {
    app.enableCors({
      origin: allowedOrigins.map((o) => new RegExp(o)),
      methods: allowedMethods,
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Forwarded-for'],
      preflightContinue: false,
    });
  }

  // Setup Swagger
  const devMode = configService.get<boolean>('devMode');
  if (devMode) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Desk Compass')
      .setDescription('CRUD and management of necessary data for desk compass')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/swagger', app, document);
  }
  await app.listen(configService.get<number>('appPort'));

  const appUrl = await app.getUrl();
  app.get(Logger).log('Started application at ' + appUrl);
}

bootstrap();
