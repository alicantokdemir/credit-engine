import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { MetricsService } from './metrics.service';

@ApiTags('monitoring')
@Controller()
export class MonitoringController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe endpoint' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        uptime: 120,
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(@Res({ passthrough: true }) response: Response) {
    response.setHeader('Content-Type', this.metricsService.contentType);
    return this.metricsService.getMetrics();
  }
}
