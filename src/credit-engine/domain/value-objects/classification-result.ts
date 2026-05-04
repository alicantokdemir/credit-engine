import { ClusterRule, JobCategoryRule } from '../rules/rules';

export class ClassificationResult {
  constructor(
    public readonly cluster: ClusterRule,
    public readonly jobCategory: JobCategoryRule,
    public readonly jobMultiplier: number,
    public readonly penaltyFactor: number,
    public readonly baseLimit: number,
    public readonly cap: number,
    public readonly approvedLimit: number,
    public readonly monthlyIncome: number,
    public readonly approved: boolean,
  ) {}
}
