import { ClassificationResult } from '../../domain/value-objects/classification-result';
import { Customer } from '../../domain/entities/customer';
import { Location } from '../../domain/value-objects/location';
import { MarketDebt } from '../../domain/value-objects/market-debt';
import { ClassifyCustomerRequestDto } from '../http/dto/classify-customer.request.dto';
import { ClassifyCustomerResponseDto } from '../http/dto/classify-customer.response.dto';

export class CustomerMapper {
  static toDomain(input: ClassifyCustomerRequestDto): Customer {
    const marketDebt = new MarketDebt(
      input.has_market_debt,
      input.market_debt_types ?? [],
    );
    const location = new Location(
      input.location.city,
      input.location.state,
      input.location.region,
    );

    return new Customer(
      input.id,
      input.name,
      input.age,
      input.score,
      marketDebt,
      location,
      input.job_title,
    );
  }

  static toResponse(
    input: ClassifyCustomerRequestDto,
    result: ClassificationResult,
  ): ClassifyCustomerResponseDto {
    return {
      id: input.id,
      name: input.name,
      age: input.age,
      score: input.score,
      has_market_debt: input.has_market_debt,
      market_debt_types: input.market_debt_types ?? [],
      location: input.location,
      job_title: input.job_title,
      cluster_id: result.cluster.id,
      cluster_name: result.cluster.name,
      job_category: result.jobCategory.id,
      job_multiplier: result.jobMultiplier,
      penalty_factor: result.penaltyFactor,
      base_limit: result.baseLimit,
      cap: result.cap,
      approved: result.approved,
      approved_limit: result.approvedLimit,
      monthly_income: result.monthlyIncome,
    };
  }
}
