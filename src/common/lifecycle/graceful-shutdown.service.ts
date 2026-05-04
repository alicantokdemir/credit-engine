import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';

@Injectable()
export class GracefulShutdownService
  implements BeforeApplicationShutdown, OnApplicationShutdown
{
  private readonly logger = new Logger(GracefulShutdownService.name);

  beforeApplicationShutdown(signal?: string): void {
    this.logger.warn(
      `Shutdown requested${signal ? ` via ${signal}` : ''}. Closing resources...`,
    );
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.log(
      `Application shutdown complete${signal ? ` (${signal})` : ''}.`,
    );
  }
}
