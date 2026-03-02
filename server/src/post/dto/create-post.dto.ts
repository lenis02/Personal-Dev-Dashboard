import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PostCategory } from '../entity/post.entity';

export class CreatePostDto {
  @IsEnum(PostCategory, { message: '올바른 카테고리를 선택해주세요.' })
  @IsNotEmpty()
  category!: PostCategory;

  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content!: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @IsNotEmpty()
  authorId!: number; // 💡 테스트를 위해 임시로 추가
}
