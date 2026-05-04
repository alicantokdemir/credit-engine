import { RulesJsonRepository } from './rules-json.repository';

describe('RulesJsonRepository', () => {
  it('loads and maps default JSON rules', async () => {
    const repository = new RulesJsonRepository();
    const rules = await repository.getRules();

    expect(rules.clusters.length).toBeGreaterThan(0);
    expect(rules.jobCategories.length).toBeGreaterThan(0);
    expect(rules.penalties.length).toBeGreaterThan(0);
    expect(rules.incomeMatrix.CLUSTER_A.EXECUTIVE).toBe(30000);
  });

  it('maps optional fields with defaults', () => {
    const repository = new RulesJsonRepository() as unknown as {
      mapRules: (data: unknown) => {
        clusters: Array<{ denied: boolean; debt?: unknown }>;
        jobCategories: Array<{ keywords: string[] }>;
      };
    };

    const mapped = repository.mapRules({
      clusters: [
        {
          id: 'X',
          name: 'X',
          priority: 1,
          base_limit: 100,
          cap: 200,
        },
      ],
      job_categories: [
        {
          id: 'CAT',
          priority: 1,
          multiplier: 1,
        },
      ],
      penalties: [],
      income_matrix: { X: { CAT: 0 } },
    });

    expect(mapped.clusters[0].denied).toBe(false);
    expect(mapped.clusters[0].debt).toBeUndefined();
    expect(mapped.jobCategories[0].keywords).toEqual([]);
  });
});
