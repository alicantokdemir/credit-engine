export interface ClusterDebtRuleDbEntity {
  has_market_debt?: boolean;
  disallowed_types?: string[];
}

export interface ClusterRuleDbEntity {
  id: string;
  name: string;
  priority: number;
  score_min?: number;
  age_min?: number;
  age_max?: number;
  debt?: ClusterDebtRuleDbEntity;
  base_limit: number;
  cap: number;
  denied?: boolean;
}

export interface JobCategoryRuleDbEntity {
  id: string;
  priority: number;
  multiplier: number;
  keywords: string[];
}

export interface PenaltyRuleDbEntity {
  id: string;
  priority: number;
  multiplier: number;
  disallowed_types: string[];
}

export interface RulesDbEntity {
  clusters: ClusterRuleDbEntity[];
  job_categories: JobCategoryRuleDbEntity[];
  penalties: PenaltyRuleDbEntity[];
  income_matrix: Record<string, Record<string, number>>;
}
