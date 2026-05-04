import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { GracefulShutdownService } from './common/lifecycle/graceful-shutdown.service';
import { MonitoringController } from './common/monitoring/monitoring.controller';
import { MetricsService } from './common/monitoring/metrics.service';
import { CreditEngineModule } from './credit-engine/credit-engine.module';

@Module({
  imports: [CreditEngineModule],
  controllers: [AppController, MonitoringController],
  providers: [
    AppService,
    MetricsService,
    GracefulShutdownService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
