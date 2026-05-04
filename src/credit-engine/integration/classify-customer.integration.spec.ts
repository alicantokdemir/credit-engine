import { ClassifyCustomerUseCase } from '../application/use-cases/classify-customer.use-case';
import { DebtType } from '../domain/enums/debt-type';
import { Region } from '../domain/enums/region';
import { RulesJsonRepository } from '../infrastructure/repositories/rules-json.repository';
import { ClassifyCustomerRequestDto } from '../interfaces/http/dto/classify-customer.request.dto';

describe('ClassifyCustomerUseCase (integration)', () => {
  it('classifies a customer using JSON rules', async () => {
    const useCase = new ClassifyCustomerUseCase(new RulesJsonRepository());
    const payload: ClassifyCustomerRequestDto = {
      id: 'cust_100',
      name: 'Ana Braga',
      age: 40,
      score: 720,
      has_market_debt: false,
      market_debt_types: [],
      location: {
        city: 'Sao Paulo',
        state: 'SP',
        region: Region.SUDESTE,
      },
      job_title: 'Senior Manager',
    };

    const result = await useCase.execute(payload);

    expect(result.cluster_id).toBe('CLUSTER_A');
    expect(result.cluster_name).toBe('Diamond');
    expect(result.job_category).toBe('SENIOR_PROFESSIONAL');
    expect(result.job_multiplier).toBe(1.5);
    expect(result.penalty_factor).toBe(1);
    expect(result.approved_limit).toBe(75000);
    expect(result.monthly_income).toBe(20000);
    expect(result.approved).toBe(true);
  });

  it('applies penalties when default debts are present', async () => {
    const useCase = new ClassifyCustomerUseCase(new RulesJsonRepository());
    const payload: ClassifyCustomerRequestDto = {
      id: 'cust_200',
      name: 'Rafael Lima',
      age: 35,
      score: 650,
      has_market_debt: true,
      market_debt_types: [DebtType.CREDIT_DEFAULT],
      location: {
        city: 'Rio de Janeiro',
        state: 'RJ',
        region: Region.SUDESTE,
      },
      job_title: 'Engineer',
    };

    const result = await useCase.execute(payload);

    expect(result.cluster_id).toBe('CLUSTER_C');
    expect(result.penalty_factor).toBe(0.5);
    expect(result.approved_limit).toBe(2500);
  });
});
