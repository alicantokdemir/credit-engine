import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DebtType } from '../../../domain/enums/debt-type';
import { Region } from '../../../domain/enums/region';

export class LocationDto {
  @ApiProperty({ example: 'Sao Paulo' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: Region.SUDESTE, enum: Region })
  @IsEnum(Region)
  region!: Region;
}

export class ClassifyCustomerRequestDto {
  @ApiProperty({ example: 'cust_123' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 32 })
  @IsInt()
  @Min(0)
  age!: number;

  @ApiProperty({ example: 720, minimum: 0, maximum: 1000 })
  @IsInt()
  @Min(0)
  @Max(1000)
  score!: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  has_market_debt!: boolean;

  @ApiProperty({
    example: ['credit_card'],
    isArray: true,
    required: false,
    enum: DebtType,
  })
  @ValidateIf((dto) => dto.market_debt_types !== undefined)
  @IsArray()
  @IsEnum(DebtType, { each: true })
  @ValidateIf((dto) => dto.has_market_debt === true)
  @ArrayNotEmpty()
  market_debt_types?: DebtType[];

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @ApiProperty({ example: 'Senior Engineer' })
  @IsString()
  @IsNotEmpty()
  job_title!: string;
}
