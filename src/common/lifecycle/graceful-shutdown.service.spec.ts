import { Logger } from '@nestjs/common';
import { GracefulShutdownService } from './graceful-shutdown.service';

describe('GracefulShutdownService', () => {
  it('logs shutdown requested with and without signal', () => {
    const warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const service = new GracefulShutdownService();

    service.beforeApplicationShutdown('SIGTERM');
    service.beforeApplicationShutdown();

    expect(warnSpy).toHaveBeenNthCalledWith(
      1,
      'Shutdown requested via SIGTERM. Closing resources...',
    );
    expect(warnSpy).toHaveBeenNthCalledWith(
      2,
      'Shutdown requested. Closing resources...',
    );
  });

  it('logs shutdown complete with and without signal', () => {
    const logSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    const service = new GracefulShutdownService();

    service.onApplicationShutdown('SIGINT');
    service.onApplicationShutdown();

    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      'Application shutdown complete (SIGINT).',
    );
    expect(logSpy).toHaveBeenNthCalledWith(2, 'Application shutdown complete.');
  });
});
