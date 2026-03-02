import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  socialId!: string;

  @IsString()
  @IsNotEmpty()
  provider!: string;
}
