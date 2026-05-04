import { DebtType } from '../enums/debt-type';

export interface ClusterDebtRule {
  hasMarketDebt?: boolean;
  disallowedTypes?: DebtType[];
}

export interface ClusterRule {
  id: string;
  name: string;
  priority: number;
  scoreMin?: number;
  ageMin?: number;
  ageMax?: number;
  debt?: ClusterDebtRule;
  baseLimit: number;
  cap: number;
  denied?: boolean;
}

export interface JobCategoryRule {
  id: string;
  priority: number;
  multiplier: number;
  keywords: string[];
}

export interface PenaltyRule {
  id: string;
  priority: number;
  multiplier: number;
  disallowedTypes: DebtType[];
}

export interface Rules {
  clusters: ClusterRule[];
  jobCategories: JobCategoryRule[];
  penalties: PenaltyRule[];
  incomeMatrix: Record<string, Record<string, number>>;
}
