import { Inject, Injectable } from '@nestjs/common';
import { RULES_REPOSITORY } from '../../domain/repositories/rules.repository';
import type { RulesRepository } from '../../domain/repositories/rules.repository';
import { ClassificationEngine } from '../../domain/services/classification-engine';
import { ClassifyCustomerRequestDto } from '../../interfaces/http/dto/classify-customer.request.dto';
import { ClassifyCustomerResponseDto } from '../../interfaces/http/dto/classify-customer.response.dto';
import { CustomerMapper } from '../../interfaces/mappers/customer.mapper';

@Injectable()
export class ClassifyCustomerUseCase {
  private readonly engine = new ClassificationEngine();

  constructor(
    @Inject(RULES_REPOSITORY) private readonly rulesRepository: RulesRepository,
  ) {}

  async execute(
    input: ClassifyCustomerRequestDto,
  ): Promise<ClassifyCustomerResponseDto> {
    const rules = await this.rulesRepository.getRules();
    const customer = CustomerMapper.toDomain(input);
    const result = this.engine.classify(customer, rules);

    return CustomerMapper.toResponse(input, result);
  }
}
