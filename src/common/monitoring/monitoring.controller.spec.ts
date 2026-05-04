import type { Response } from 'express';
import { MonitoringController } from './monitoring.controller';
import { MetricsService } from './metrics.service';

describe('MonitoringController', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns health payload with uptime and timestamp', () => {
    const metricsService = new MetricsService();
    const controller = new MonitoringController(metricsService);
    jest.spyOn(process, 'uptime').mockReturnValue(123.9);

    const result = controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.uptime).toBe(123);
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('sets content type header and returns metrics body', async () => {
    const metricsService = new MetricsService();
    const expectedContentType = 'text/plain; version=0.0.4; charset=utf-8';
    const contentTypeSpy = jest
      .spyOn(metricsService, 'contentType', 'get')
      .mockReturnValue(expectedContentType);
    const getMetricsSpy = jest
      .spyOn(metricsService, 'getMetrics')
      .mockResolvedValue('my_metrics_payload');

    const controller = new MonitoringController(metricsService);
    const setHeader = jest.fn();
    const response = {
      setHeader,
    } as unknown as Response;

    const result = await controller.getMetrics(response);

    expect(setHeader).toHaveBeenCalledWith('Content-Type', expectedContentType);
    expect(contentTypeSpy).toHaveBeenCalled();
    expect(getMetricsSpy).toHaveBeenCalledTimes(1);
    expect(result).toBe('my_metrics_payload');
  });
});
