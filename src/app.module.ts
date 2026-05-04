import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreditEngineModule } from './credit-engine/credit-engine.module';

@Module({
  imports: [CreditEngineModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
