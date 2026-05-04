import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(adapterHost: HttpAdapterHost) {
    super(adapterHost.httpAdapter);
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const method = request?.method ?? 'UNKNOWN';
    const path = request?.url ?? 'UNKNOWN';

    if (status >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`HTTP ${status} ${method} ${path}`, stack);
    } else {
      this.logger.warn(`HTTP ${status} ${method} ${path}`);
    }

    if (exception instanceof HttpException) {
      super.catch(exception, host);
      return;
    }

    const internalException = new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    super.catch(internalException, host);
  }
}
