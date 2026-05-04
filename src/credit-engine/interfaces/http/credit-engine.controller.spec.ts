import { Test } from '@nestjs/testing';
import { CreditEngineController } from './credit-engine.controller';
import { ClassifyCustomerUseCase } from '../../application/use-cases/classify-customer.use-case';
import { Region } from '../../domain/enums/region';

describe('CreditEngineController', () => {
  it('delegates classification to use case', async () => {
    const execute = jest.fn().mockResolvedValue({ approved: true });

    const moduleRef = await Test.createTestingModule({
      controllers: [CreditEngineController],
      providers: [
        {
          provide: ClassifyCustomerUseCase,
          useValue: { execute },
        },
      ],
    }).compile();

    const controller = moduleRef.get(CreditEngineController);
    const payload = {
      id: 'c1',
      name: 'Alice',
      age: 30,
      score: 700,
      has_market_debt: false,
      market_debt_types: [],
      location: { city: 'Sao Paulo', state: 'SP', region: Region.SUDESTE },
      job_title: 'Engineer',
    };

    const response = await controller.classify(payload);

    expect(execute).toHaveBeenCalledWith(payload);
    expect(response).toEqual({ approved: true });
  });
});
