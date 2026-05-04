import { DebtType } from '../enums/debt-type';

export class MarketDebt {
  constructor(
    public readonly hasMarketDebt: boolean,
    public readonly types: DebtType[],
  ) {}
}
