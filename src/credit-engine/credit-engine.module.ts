import { Module } from '@nestjs/common';
import { ClassifyCustomerUseCase } from './application/use-cases/classify-customer.use-case';
import { RULES_REPOSITORY } from './domain/repositories/rules.repository';
import { RulesJsonRepository } from './infrastructure/repositories/rules-json.repository';
import { CreditEngineController } from './interfaces/http/credit-engine.controller';

@Module({
  controllers: [CreditEngineController],
  providers: [
    ClassifyCustomerUseCase,
    {
      provide: RULES_REPOSITORY,
      useClass: RulesJsonRepository,
    },
  ],
})
export class CreditEngineModule {}
