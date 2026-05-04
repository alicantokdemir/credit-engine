import { CustomerMapper } from './customer.mapper';
import { Region } from '../../domain/enums/region';
import { DebtType } from '../../domain/enums/debt-type';
import { ClassificationResult } from '../../domain/value-objects/classification-result';

describe('CustomerMapper', () => {
  it('maps request DTO to domain customer with default debt types', () => {
    const input = {
      id: 'c1',
      name: 'Alice',
      age: 30,
      score: 700,
      has_market_debt: false,
      location: { city: 'Sao Paulo', state: 'SP', region: Region.SUDESTE },
      job_title: 'Engineer',
    };

    const customer = CustomerMapper.toDomain(input);

    expect(customer.id).toBe('c1');
    expect(customer.marketDebt.types).toEqual([]);
    expect(customer.location.region).toBe(Region.SUDESTE);
  });

  it('maps domain result to response DTO', () => {
    const input = {
      id: 'c2',
      name: 'Bob',
      age: 45,
      score: 720,
      has_market_debt: true,
      market_debt_types: [DebtType.CREDIT_CARD],
      location: { city: 'Rio', state: 'RJ', region: Region.SUDESTE },
      job_title: 'Senior Manager',
    };

    const result = new ClassificationResult(
      {
        id: 'CLUSTER_A',
        name: 'Diamond',
        priority: 1,
        baseLimit: 50000,
        cap: 100000,
      },
      {
        id: 'SENIOR_PROFESSIONAL',
        priority: 2,
        multiplier: 1.5,
        keywords: ['Senior'],
      },
      1.5,
      1,
      50000,
      100000,
      75000,
      20000,
      true,
    );

    const output = CustomerMapper.toResponse(input, result);

    expect(output.cluster_id).toBe('CLUSTER_A');
    expect(output.job_category).toBe('SENIOR_PROFESSIONAL');
    expect(output.approved_limit).toBe(75000);
    expect(output.market_debt_types).toEqual([DebtType.CREDIT_CARD]);
  });
});
