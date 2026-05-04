import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/http/global-exception.filter';

const bootstrapLogger = new Logger('Bootstrap');
const requestLogger = new Logger('HTTP');

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use((request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();

    response.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      const message = `${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms`;

      if (response.statusCode >= 500) {
        requestLogger.error(message);
        return;
      }

      if (response.statusCode >= 400) {
        requestLogger.warn(message);
        return;
      }

      requestLogger.log(message);
    });

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));

  const shouldEnableSwagger =
    process.env.ENABLE_SWAGGER === 'true' ||
    process.env.NODE_ENV !== 'production';
  if (shouldEnableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Credit Engine')
      .setDescription('Customer risk classification and credit limit API')
      .setVersion('1.0')
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument);
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  bootstrapLogger.log(`Application is running on port ${port}.`);
}

export function startApplication(
  env: string | undefined = process.env.NODE_ENV,
  start: () => Promise<void> = bootstrap,
): void {
  if (env !== 'test') {
    void start().catch((error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown startup error while bootstrapping application';
      const stack = error instanceof Error ? error.stack : undefined;

      bootstrapLogger.error(`Failed to start application: ${message}`, stack);
      process.exitCode = 1;
    });
  }
}

startApplication();
