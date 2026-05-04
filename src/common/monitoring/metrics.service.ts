import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  private readonly requestCounter: Counter<string>;
  private readonly requestDurationHistogram: Histogram<string>;

  constructor() {
    this.registry = new Registry();

    const labelNames = ['method', 'route', 'status_code'] as const;

    this.requestCounter = new Counter({
      name: 'credit_engine_http_requests_total',
      help: 'Total number of HTTP requests handled',
      labelNames,
      registers: [this.registry],
    });

    this.requestDurationHistogram = new Histogram({
      name: 'credit_engine_http_request_duration_ms',
      help: 'Duration of HTTP requests in milliseconds',
      labelNames,
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
      registers: [this.registry],
    });
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationMs: number,
  ): void {
    const labels = {
      method,
      route,
      status_code: String(statusCode),
    };

    this.requestCounter.inc(labels);
    this.requestDurationHistogram.observe(labels, durationMs);
  }

  get contentType(): string {
    return this.registry.contentType;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
