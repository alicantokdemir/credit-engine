import { ClassifyCustomerUseCase } from '../application/use-cases/classify-customer.use-case';
import { DebtType } from '../domain/enums/debt-type';
import { Region } from '../domain/enums/region';
import { RulesJsonRepository } from '../infrastructure/repositories/rules-json.repository';
import { ClassifyCustomerRequestDto } from '../interfaces/http/dto/classify-customer.request.dto';

type PayloadOverrides = Partial<ClassifyCustomerRequestDto>;

const createUseCase = () => new ClassifyCustomerUseCase(new RulesJsonRepository());

let sequence = 0;

const buildPayload = (
  overrides: PayloadOverrides = {},
): ClassifyCustomerRequestDto => {
  sequence += 1;

  return {
    id: `cust_${sequence}`,
    name: 'Integration Customer',
    age: 35,
    score: 650,
    has_market_debt: false,
    market_debt_types: [],
    location: {
      city: 'Sao Paulo',
      state: 'SP',
      region: Region.SUDESTE,
    },
    job_title: 'Engineer',
    ...overrides,
  };
};

describe('ClassifyCustomerUseCase (integration)', () => {
  it('assigns CLUSTER_A on boundary values and computes expected output', async () => {
    const useCase = createUseCase();
    const payload = buildPayload({
      age: 25,
      score: 700,
      has_market_debt: false,
      market_debt_types: [],
      job_title: 'Senior Manager',
    });

    const result = await useCase.execute(payload);

    expect(result.cluster_id).toBe('CLUSTER_A');
    expect(result.cluster_name).toBe('Diamond');
    expect(result.job_category).toBe('SENIOR_PROFESSIONAL');
    expect(result.job_multiplier).toBe(1.5);
    expect(result.penalty_factor).toBe(1);
    expect(result.base_limit).toBe(50000);
    expect(result.cap).toBe(100000);
    expect(result.approved_limit).toBe(75000);
    expect(result.monthly_income).toBe(20000);
    expect(result.approved).toBe(true);
  });

  it('does not allow CLUSTER_A when market debt exists, even with high score', async () => {
    const useCase = createUseCase();
    const payload = buildPayload({
      age: 40,
      score: 720,
      has_market_debt: true,
      market_debt_types: [DebtType.CREDIT_CARD],
      job_title: 'Engineer',
    });

    const result = await useCase.execute(payload);

    expect(result.cluster_id).toBe('CLUSTER_B');
    expect(result.cluster_name).toBe('Gold');
  });

  it('assigns CLUSTER_B when CLUSTER_A age condition is not met', async () => {
    const useCase = createUseCase();
    const payload = buildPayload({
      age: 61,
      score: 700,
      has_market_debt: false,
      market_debt_types: [],
      job_title: 'Engineer',
    });

    const result = await useCase.execute(payload);

    expect(result.cluster_id).toBe('CLUSTER_B');
    expect(result.base_limit).toBe(20000);
    expect(result.cap).toBe(40000);
    expect(result.approved).toBe(true);
  });

  it.each([
    [DebtType.CREDIT_DEFAULT],
    [DebtType.LOAN_DEFAULT],
  ])(
    'assigns CLUSTER_C and applies default penalty when debt type %s exists',
    async (defaultDebtType: DebtType) => {
      const useCase = createUseCase();
      const payload = buildPayload({
        age: 35,
        score: 650,
        has_market_debt: true,
        market_debt_types: [defaultDebtType],
        job_title: 'Engineer',
      });

      const result = await useCase.execute(payload);

      expect(result.cluster_id).toBe('CLUSTER_C');
      expect(result.penalty_factor).toBe(0.5);
      expect(result.approved_limit).toBe(2500);
      expect(result.approved).toBe(true);
    },
  );

  it('assigns CLUSTER_D as catch-all and denies approval', async () => {
    const useCase = createUseCase();
    const payload = buildPayload({
      age: 35,
      score: 299,
      has_market_debt: false,
      market_debt_types: [],
      job_title: 'Engineer',
    });

    const result = await useCase.execute(payload);

    expect(result.cluster_id).toBe('CLUSTER_D');
    expect(result.cluster_name).toBe('Bronze');
    expect(result.approved).toBe(false);
    expect(result.base_limit).toBe(0);
    expect(result.cap).toBe(0);
    expect(result.approved_limit).toBe(0);
    expect(result.monthly_income).toBe(0);
  });

  it('matches job categories case-insensitively and by priority order', async () => {
    const useCase = createUseCase();
    const payload = buildPayload({
      score: 650,
      age: 35,
      has_market_debt: false,
      market_debt_types: [],
      job_title: 'vP senior engineer',
    });

    const result = await useCase.execute(payload);

    expect(result.cluster_id).toBe('CLUSTER_B');
    expect(result.job_category).toBe('EXECUTIVE');
    expect(result.job_multiplier).toBe(2);
    expect(result.approved_limit).toBe(40000);
  });

  it('falls back to OTHER category when no job keyword matches', async () => {
    const useCase = createUseCase();
    const payload = buildPayload({
      score: 650,
      age: 35,
      has_market_debt: false,
      market_debt_types: [],
      job_title: 'Baker',
    });

    const result = await useCase.execute(payload);

    expect(result.cluster_id).toBe('CLUSTER_B');
    expect(result.job_category).toBe('OTHER');
    expect(result.job_multiplier).toBe(0.8);
    expect(result.approved_limit).toBe(16000);
    expect(result.monthly_income).toBe(6500);
  });

  it('applies rounding to the nearest 100 in approved limit formula', async () => {
    const useCase = createUseCase();
    const payload = buildPayload({
      score: 650,
      age: 35,
      has_market_debt: true,
      market_debt_types: [DebtType.CREDIT_DEFAULT],
      job_title: 'Trainee',
    });

    const result = await useCase.execute(payload);

    expect(result.cluster_id).toBe('CLUSTER_C');
    expect(result.job_category).toBe('JUNIOR_PROFESSIONAL');
    expect(result.job_multiplier).toBe(0.7);
    expect(result.penalty_factor).toBe(0.5);
    expect(result.approved_limit).toBe(1800);
  });

  it('covers monthly income matrix for all cluster and job-category combinations', async () => {
    const useCase = createUseCase();

    const jobByCategory = {
      EXECUTIVE: 'CEO',
      SENIOR_PROFESSIONAL: 'Senior Manager',
      MID_PROFESSIONAL: 'Engineer',
      JUNIOR_PROFESSIONAL: 'Trainee',
      OTHER: 'Farmer',
    } as const;

    const matrix = {
      CLUSTER_A: {
        overrides: {
          score: 720,
          age: 40,
          has_market_debt: false,
          market_debt_types: [],
        },
        incomes: {
          EXECUTIVE: 30000,
          SENIOR_PROFESSIONAL: 20000,
          MID_PROFESSIONAL: 12000,
          JUNIOR_PROFESSIONAL: 8000,
          OTHER: 10000,
        },
      },
      CLUSTER_B: {
        overrides: {
          score: 650,
          age: 35,
          has_market_debt: true,
          market_debt_types: [DebtType.CREDIT_CARD],
        },
        incomes: {
          EXECUTIVE: 20000,
          SENIOR_PROFESSIONAL: 15000,
          MID_PROFESSIONAL: 8000,
          JUNIOR_PROFESSIONAL: 5000,
          OTHER: 6500,
        },
      },
      CLUSTER_C: {
        overrides: {
          score: 650,
          age: 35,
          has_market_debt: true,
          market_debt_types: [DebtType.CREDIT_DEFAULT],
        },
        incomes: {
          EXECUTIVE: 10000,
          SENIOR_PROFESSIONAL: 7000,
          MID_PROFESSIONAL: 5000,
          JUNIOR_PROFESSIONAL: 3000,
          OTHER: 4000,
        },
      },
      CLUSTER_D: {
        overrides: {
          score: 250,
          age: 35,
          has_market_debt: false,
          market_debt_types: [],
        },
        incomes: {
          EXECUTIVE: 0,
          SENIOR_PROFESSIONAL: 0,
          MID_PROFESSIONAL: 0,
          JUNIOR_PROFESSIONAL: 0,
          OTHER: 0,
        },
      },
    } as const;

    for (const [clusterId, clusterCase] of Object.entries(matrix)) {
      for (const [categoryId, income] of Object.entries(clusterCase.incomes)) {
        const payload = buildPayload({
          ...clusterCase.overrides,
          job_title: jobByCategory[categoryId as keyof typeof jobByCategory],
        });

        const result = await useCase.execute(payload);

        expect(result.cluster_id).toBe(clusterId);
        expect(result.job_category).toBe(categoryId);
        expect(result.monthly_income).toBe(income);
      }
    }
  });
});
