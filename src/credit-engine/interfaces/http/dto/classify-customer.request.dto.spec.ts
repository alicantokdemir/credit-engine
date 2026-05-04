import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DebtType } from '../../../../credit-engine/domain/enums/debt-type';
import { Region } from '../../../../credit-engine/domain/enums/region';
import { ClassifyCustomerRequestDto } from './classify-customer.request.dto';

describe('ClassifyCustomerRequestDto', () => {
  it('validates a correct payload', async () => {
    const dto = plainToInstance(ClassifyCustomerRequestDto, {
      id: 'c1',
      name: 'Alice',
      age: 30,
      score: 750,
      has_market_debt: true,
      market_debt_types: [DebtType.CREDIT_CARD],
      location: { city: 'Sao Paulo', state: 'SP', region: Region.SUDESTE },
      job_title: 'Engineer',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('fails validation when required fields are missing', async () => {
    const dto = plainToInstance(ClassifyCustomerRequestDto, {});
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('requires debt types when has_market_debt is true', async () => {
    const dto = plainToInstance(ClassifyCustomerRequestDto, {
      id: 'c2',
      name: 'Bob',
      age: 41,
      score: 600,
      has_market_debt: true,
      location: { city: 'Rio', state: 'RJ', region: Region.SUDESTE },
      job_title: 'Manager',
    });

    const errors = await validate(dto);
    expect(errors.some((item) => item.property === 'market_debt_types')).toBe(
      true,
    );
  });
});
