import { RulesJsonRepository } from '../../infrastructure/repositories/rules-json.repository';
import { Customer } from '../entities/customer';
import { Location } from '../value-objects/location';
import { MarketDebt } from '../value-objects/market-debt';
import { DebtType } from '../enums/debt-type';
import { Region } from '../enums/region';
import { Rules } from '../rules/rules';
import {
  calculateApprovedLimit,
  ClassificationEngine,
  getMonthlyIncome,
} from './classification-engine';

type CustomerOverrides = Partial<{
  id: string;
  name: string;
  age: number;
  score: number;
  hasMarketDebt: boolean;
  marketDebtTypes: DebtType[];
  jobTitle: string;
}>;

describe('ClassificationEngine', () => {
  let rules: Rules;
  let engine: ClassificationEngine;

  beforeAll(async () => {
    rules = await new RulesJsonRepository().getRules();
    engine = new ClassificationEngine();
  });

  const buildCustomer = (overrides: CustomerOverrides = {}) => {
    const location = new Location('Sao Paulo', 'SP', Region.SUDESTE);
    const marketDebt = new MarketDebt(
      overrides.hasMarketDebt ?? false,
      overrides.marketDebtTypes ?? [],
    );

    return new Customer(
      overrides.id ?? 'cust_1',
      overrides.name ?? 'Test User',
      overrides.age ?? 30,
      overrides.score ?? 700,
      marketDebt,
      location,
      overrides.jobTitle ?? 'Engineer',
    );
  };

  it('assigns cluster A at score and age boundaries', () => {
    const customer = buildCustomer({ age: 60, score: 700 });
    const result = engine.classify(customer, rules);
    expect(result.cluster.id).toBe('CLUSTER_A');
  });

  it('assigns cluster B when age exceeds cluster A max', () => {
    const customer = buildCustomer({ age: 61, score: 700 });
    const result = engine.classify(customer, rules);
    expect(result.cluster.id).toBe('CLUSTER_B');
  });

  it('assigns cluster B at score and age boundaries without defaults', () => {
    const customer = buildCustomer({
      age: 18,
      score: 500,
      hasMarketDebt: true,
      marketDebtTypes: [DebtType.CREDIT_CARD],
    });
    const result = engine.classify(customer, rules);
    expect(result.cluster.id).toBe('CLUSTER_B');
  });

  it('assigns cluster C when defaults exclude higher clusters', () => {
    const customer = buildCustomer({
      age: 17,
      score: 300,
      hasMarketDebt: true,
      marketDebtTypes: [DebtType.CREDIT_DEFAULT],
    });
    const result = engine.classify(customer, rules);
    expect(result.cluster.id).toBe('CLUSTER_C');
  });

  it('assigns cluster D when below minimum score', () => {
    const customer = buildCustomer({ score: 299 });
    const result = engine.classify(customer, rules);
    expect(result.cluster.id).toBe('CLUSTER_D');
  });

  it('matches job category by priority and case-insensitively', () => {
    const customer = buildCustomer({ jobTitle: 'Senior VP Engineer' });
    const result = engine.classify(customer, rules);
    expect(result.jobCategory.id).toBe('EXECUTIVE');
  });

  it('matches executive job titles regardless of casing', () => {
    const customer = buildCustomer({ jobTitle: 'cTo' });
    const result = engine.classify(customer, rules);
    expect(result.jobCategory.id).toBe('EXECUTIVE');
  });

  it('uses OTHER job category when no keyword matches', () => {
    const customer = buildCustomer({ jobTitle: 'Baker' });
    const result = engine.classify(customer, rules);
    expect(result.jobCategory.id).toBe('OTHER');
  });

  it('applies default debt penalty factor', () => {
    const customer = buildCustomer({
      hasMarketDebt: true,
      marketDebtTypes: [DebtType.CREDIT_DEFAULT],
    });
    const result = engine.classify(customer, rules);
    expect(result.penaltyFactor).toBe(0.5);
  });

  it('does not match cluster with market debt mismatch', () => {
    const customer = buildCustomer({
      score: 720,
      hasMarketDebt: true,
      marketDebtTypes: [DebtType.CREDIT_CARD],
    });
    const result = engine.classify(customer, rules);
    expect(result.cluster.id).toBe('CLUSTER_B');
  });

  it('falls back to last category when OTHER is not configured', () => {
    const customer = buildCustomer({ jobTitle: 'NoMatchTitle' });
    const customRules: Rules = {
      ...rules,
      jobCategories: [
        {
          id: 'EXECUTIVE',
          priority: 1,
          multiplier: 2,
          keywords: ['CEO'],
        },
        {
          id: 'CUSTOM_LAST',
          priority: 2,
          multiplier: 0.9,
          keywords: [],
        },
      ],
    };

    const result = engine.classify(customer, customRules);
    expect(result.jobCategory.id).toBe('CUSTOM_LAST');
  });

  it('keeps penalty factor as 1 when debt exists but no penalty matches', () => {
    const customer = buildCustomer({
      hasMarketDebt: true,
      marketDebtTypes: [DebtType.MORTGAGE],
    });
    const result = engine.classify(customer, rules);
    expect(result.penaltyFactor).toBe(1);
  });

  it('computes approved limit with rounding and cap enforcement', () => {
    expect(calculateApprovedLimit(5000, 0.7, 0.5, 10000)).toBe(1800);
    expect(calculateApprovedLimit(1000, 10, 1, 5000)).toBe(5000);
  });

  it('returns monthly income for each cluster and job category', () => {
    for (const cluster of rules.clusters) {
      for (const category of rules.jobCategories) {
        const income = getMonthlyIncome(rules, cluster.id, category.id);
        expect(income).toBe(rules.incomeMatrix[cluster.id][category.id]);
      }
    }
  });

  it('denies cluster D with zero approved limit', () => {
    const customer = buildCustomer({ score: 100 });
    const result = engine.classify(customer, rules);
    expect(result.approved).toBe(false);
    expect(result.approvedLimit).toBe(0);
  });
});
