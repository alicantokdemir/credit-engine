import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ClassifyCustomerUseCase } from '../../application/use-cases/classify-customer.use-case';
import { ClassifyCustomerRequestDto } from './dto/classify-customer.request.dto';
import { ClassifyCustomerResponseDto } from './dto/classify-customer.response.dto';

@ApiTags('customers')
@Controller('customers')
export class CreditEngineController {
  constructor(private readonly classifyCustomer: ClassifyCustomerUseCase) {}

  @Post('classify')
  @ApiOperation({ summary: 'Classify a customer and compute credit limits' })
  @ApiCreatedResponse({ type: ClassifyCustomerResponseDto })
  @ApiBadRequestResponse({ description: 'Validation error' })
  async classify(
    @Body() payload: ClassifyCustomerRequestDto,
  ): Promise<ClassifyCustomerResponseDto> {
    return this.classifyCustomer.execute(payload);
  }
}
