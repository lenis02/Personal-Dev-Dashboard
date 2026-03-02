import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserSbdDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsInt()
  height!: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  weight!: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  SBD!: number;
}
