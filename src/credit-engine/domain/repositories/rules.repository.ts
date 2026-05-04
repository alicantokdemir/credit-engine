import { Rules } from '../rules/rules';

export const RULES_REPOSITORY = Symbol('RULES_REPOSITORY');

export interface RulesRepository {
  getRules(): Promise<Rules>;
}
