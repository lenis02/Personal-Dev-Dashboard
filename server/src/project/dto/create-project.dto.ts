import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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
}
