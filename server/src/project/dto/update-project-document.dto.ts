import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProjectDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  @IsUrl(
    { require_tld: false },
    { message: 'imageUrl must be a valid URL' }
  )
  imageUrl?: string;
}

