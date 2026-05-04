import { DebtType } from '../../domain/enums/debt-type';
import { RulesRepository } from '../../domain/repositories/rules.repository';
import { Rules } from '../../domain/rules/rules';
import { RulesDbEntity } from '../entities/rules-db-entity';
import rulesData from '../rules/rules.json';

export class RulesJsonRepository implements RulesRepository {
  private readonly rules: Rules;

  constructor() {
    this.rules = this.mapRules(rulesData as RulesDbEntity);
  }

  async getRules(): Promise<Rules> {
    return this.rules;
  }

  private mapRules(data: RulesDbEntity): Rules {
    return {
      clusters: data.clusters.map((cluster) => ({
        id: cluster.id,
        name: cluster.name,
        priority: cluster.priority,
        scoreMin: cluster.score_min,
        ageMin: cluster.age_min,
        ageMax: cluster.age_max,
        debt: cluster.debt
          ? {
              hasMarketDebt: cluster.debt.has_market_debt,
              disallowedTypes: cluster.debt.disallowed_types as DebtType[],
            }
          : undefined,
        baseLimit: cluster.base_limit,
        cap: cluster.cap,
        denied: cluster.denied ?? false,
      })),
      jobCategories: data.job_categories.map((category) => ({
        id: category.id,
        priority: category.priority,
        multiplier: category.multiplier,
        keywords: category.keywords ?? [],
      })),
      penalties: data.penalties.map((penalty) => ({
        id: penalty.id,
        priority: penalty.priority,
        multiplier: penalty.multiplier,
        disallowedTypes: penalty.disallowed_types as DebtType[],
      })),
      incomeMatrix: data.income_matrix,
    };
  }
}
