import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  it('records request metrics and exposes registry output', async () => {
    const service = new MetricsService();

    service.recordHttpRequest('POST', '/customers/classify', 201, 42.5);

    const metrics = await service.getMetrics();

    expect(service.contentType).toContain('text/plain');
    expect(metrics).toContain('credit_engine_http_requests_total');
    expect(metrics).toContain('credit_engine_http_request_duration_ms');
    expect(metrics).toContain('method="POST"');
    expect(metrics).toContain('route="/customers/classify"');
    expect(metrics).toContain('status_code="201"');
  });
});
