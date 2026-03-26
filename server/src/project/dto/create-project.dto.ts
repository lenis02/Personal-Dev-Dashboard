import {
  IsIn,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @IsNotEmpty()
  clientId!: number;

  @IsOptional()
  techStack?: string[];

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PROFIT', 'NON_PROFIT'])
  revenueType?: 'PROFIT' | 'NON_PROFIT';

  @IsNumber()
  @Min(0)
  @IsOptional()
  contractAmount?: number;

  @IsString()
  @IsOptional()
  @IsIn(['FULL', 'UPFRONT_BALANCE', 'MONTHLY_INSTALLMENT'])
  contractMethod?: 'FULL' | 'UPFRONT_BALANCE' | 'MONTHLY_INSTALLMENT';

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  upfrontPercent?: number;

  @IsDateString()
  @IsOptional()
  contractSignedAt?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
