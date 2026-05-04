import { ApiProperty } from '@nestjs/swagger';
import { DebtType } from '../../../domain/enums/debt-type';
import { Region } from '../../../domain/enums/region';
import { LocationDto } from './classify-customer.request.dto';

export class ClassifyCustomerResponseDto {
  @ApiProperty({ example: 'cust_123' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 32 })
  age!: number;

  @ApiProperty({ example: 720, minimum: 0, maximum: 1000 })
  score!: number;

  @ApiProperty({ example: false })
  has_market_debt!: boolean;

  @ApiProperty({
    example: ['credit_card'],
    isArray: true,
    required: false,
    enum: DebtType,
  })
  market_debt_types?: DebtType[];

  @ApiProperty({
    type: LocationDto,
    example: { city: 'Sao Paulo', state: 'SP', region: Region.SUDESTE },
  })
  location!: LocationDto;

  @ApiProperty({ example: 'Senior Engineer' })
  job_title!: string;

  @ApiProperty({ example: 'CLUSTER_A' })
  cluster_id!: string;

  @ApiProperty({ example: 'Diamond' })
  cluster_name!: string;

  @ApiProperty({ example: 'SENIOR_PROFESSIONAL' })
  job_category!: string;

  @ApiProperty({ example: 1.5 })
  job_multiplier!: number;

  @ApiProperty({ example: 1 })
  penalty_factor!: number;

  @ApiProperty({ example: 50000 })
  base_limit!: number;

  @ApiProperty({ example: 100000 })
  cap!: number;

  @ApiProperty({ example: true })
  approved!: boolean;

  @ApiProperty({ example: 75000 })
  approved_limit!: number;

  @ApiProperty({ example: 20000 })
  monthly_income!: number;
}
