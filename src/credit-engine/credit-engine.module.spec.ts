import { Test } from '@nestjs/testing';
import { CreditEngineModule } from './credit-engine.module';
import { CreditEngineController } from './interfaces/http/credit-engine.controller';
import { ClassifyCustomerUseCase } from './application/use-cases/classify-customer.use-case';

describe('CreditEngineModule', () => {
  it('wires controller and use case providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CreditEngineModule],
    }).compile();

    expect(moduleRef.get(CreditEngineController)).toBeDefined();
    expect(moduleRef.get(ClassifyCustomerUseCase)).toBeDefined();
  });
});
