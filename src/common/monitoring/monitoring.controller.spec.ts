import type { Response } from 'express';
import { MonitoringController } from './monitoring.controller';

describe('MonitoringController', () => {
  it('returns health payload with uptime and timestamp', () => {
    const metricsService = {
      contentType: 'text/plain; version=0.0.4; charset=utf-8',
      getMetrics: jest.fn<Promise<string>, []>().mockResolvedValue('metrics'),
    };
    const controller = new MonitoringController(metricsService);
    const uptimeSpy = jest.spyOn(process, 'uptime').mockReturnValue(123.9);

    const result = controller.getHealth();

    expect(result.status).toBe('ok');
    expect(result.uptime).toBe(123);
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);

    uptimeSpy.mockRestore();
  });

  it('sets content type header and returns metrics body', async () => {
    const metricsService = {
      contentType: 'text/plain; version=0.0.4; charset=utf-8',
      getMetrics: jest
        .fn<Promise<string>, []>()
        .mockResolvedValue('my_metrics_payload'),
    };
    const controller = new MonitoringController(metricsService);
    const setHeader = jest.fn();
    const response = {
      setHeader,
    } as unknown as Response;

    const result = await controller.getMetrics(response);

    expect(setHeader).toHaveBeenCalledWith(
      'Content-Type',
      metricsService.contentType,
    );
    expect(result).toBe('my_metrics_payload');
  });
});
