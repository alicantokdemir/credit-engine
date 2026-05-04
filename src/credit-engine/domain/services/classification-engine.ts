import { ClassificationResult } from '../value-objects/classification-result';
import { Customer } from '../entities/customer';
import { Rules } from '../rules/rules';

export const roundToNearestHundred = (value: number): number =>
  Math.round(value / 100) * 100;

export const calculateApprovedLimit = (
  baseLimit: number,
  jobMultiplier: number,
  penaltyFactor: number,
  cap: number,
): number => {
  const rawLimit = baseLimit * jobMultiplier * penaltyFactor;
  const cappedLimit = Math.min(rawLimit, cap);
  return roundToNearestHundred(cappedLimit);
};

export const getMonthlyIncome = (
  rules: Rules,
  clusterId: string,
  jobCategoryId: string,
): number => rules.incomeMatrix[clusterId]?.[jobCategoryId] ?? 0;

export class ClassificationEngine {
  classify(customer: Customer, rules: Rules): ClassificationResult {
    const cluster = this.findCluster(customer, rules);
    const jobCategory = this.findJobCategory(customer.jobTitle, rules);
    const penaltyFactor = this.findPenaltyFactor(customer, rules);
    const baseLimit = cluster.baseLimit;
    const cap = cluster.cap;
    const jobMultiplier = jobCategory.multiplier;
    const approved = !cluster.denied;

    const approvedLimit = approved
      ? calculateApprovedLimit(baseLimit, jobMultiplier, penaltyFactor, cap)
      : 0;
    const monthlyIncome = getMonthlyIncome(rules, cluster.id, jobCategory.id);

    return new ClassificationResult(
      cluster,
      jobCategory,
      jobMultiplier,
      penaltyFactor,
      baseLimit,
      cap,
      approvedLimit,
      monthlyIncome,
      approved,
    );
  }

  private findCluster(customer: Customer, rules: Rules) {
    const orderedClusters = [...rules.clusters].sort(
      (left, right) => left.priority - right.priority,
    );

    for (const cluster of orderedClusters) {
      if (this.matchesCluster(customer, cluster)) {
        return cluster;
      }
    }

    return orderedClusters[orderedClusters.length - 1];
  }

  private matchesCluster(
    customer: Customer,
    cluster: Rules['clusters'][number],
  ) {
    if (cluster.scoreMin !== undefined && customer.score < cluster.scoreMin) {
      return false;
    }

    if (cluster.ageMin !== undefined && customer.age < cluster.ageMin) {
      return false;
    }

    if (cluster.ageMax !== undefined && customer.age > cluster.ageMax) {
      return false;
    }

    if (
      cluster.debt?.hasMarketDebt !== undefined &&
      customer.marketDebt.hasMarketDebt !== cluster.debt.hasMarketDebt
    ) {
      return false;
    }

    if (cluster.debt?.disallowedTypes?.length) {
      const hasDisallowedDebt = cluster.debt.disallowedTypes.some((type) =>
        customer.marketDebt.types.includes(type),
      );
      if (hasDisallowedDebt) {
        return false;
      }
    }

    return true;
  }

  private findJobCategory(jobTitle: string, rules: Rules) {
    const orderedCategories = [...rules.jobCategories].sort(
      (left, right) => left.priority - right.priority,
    );
    const normalizedTitle = jobTitle.toLowerCase();

    for (const category of orderedCategories) {
      const matches = category.keywords.some((keyword) =>
        normalizedTitle.includes(keyword.toLowerCase()),
      );
      if (matches) {
        return category;
      }
    }

    return (
      orderedCategories.find((category) => category.id === 'OTHER') ??
      orderedCategories[orderedCategories.length - 1]
    );
  }

  private findPenaltyFactor(customer: Customer, rules: Rules) {
    if (!customer.marketDebt.hasMarketDebt) {
      return 1;
    }

    const orderedPenalties = [...rules.penalties].sort(
      (left, right) => left.priority - right.priority,
    );

    for (const penalty of orderedPenalties) {
      const shouldApply = penalty.disallowedTypes.some((type) =>
        customer.marketDebt.types.includes(type),
      );
      if (shouldApply) {
        return penalty.multiplier;
      }
    }

    return 1;
  }
}
