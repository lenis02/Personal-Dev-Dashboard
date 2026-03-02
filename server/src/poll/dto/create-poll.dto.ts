import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsArray()
  @ArrayMinSize(2) // 항상 2개 이상의 선택지
  @IsString({ each: true })
  options!: string[];
}
