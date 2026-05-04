import { Location } from '../value-objects/location';
import { MarketDebt } from '../value-objects/market-debt';

export class Customer {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly age: number,
    public readonly score: number,
    public readonly marketDebt: MarketDebt,
    public readonly location: Location,
    public readonly jobTitle: string,
  ) {}
}
