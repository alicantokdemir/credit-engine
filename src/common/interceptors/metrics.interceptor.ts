import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { performance } from 'node:perf_hooks';
import type { Request, Response } from 'express';
import { MetricsService } from '../monitoring/metrics.service';

const getRouteLabel = (request: Request): string => {
  const routeValue: unknown = request.route;
  if (
    typeof routeValue === 'object' &&
    routeValue !== null &&
    'path' in routeValue
  ) {
    const routePath = (routeValue as { path?: unknown }).path;
    if (typeof routePath === 'string') {
      return routePath;
    }
  }

  return request.path || request.url;
};

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = performance.now();

    return next.handle().pipe(
      finalize(() => {
        const durationMs = performance.now() - startedAt;
        const route = getRouteLabel(request);

        this.metricsService.recordHttpRequest(
          request.method,
          route,
          response.statusCode,
          durationMs,
        );
      }),
    );
  }
}
