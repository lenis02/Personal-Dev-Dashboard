import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { PostCategory } from '../entity/post.entity';
import { CreatePollDto } from '../../poll/dto/create-poll.dto';

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

  @IsOptional()
  @ValidateIf((o) => o.category === PostCategory.DEBATE)
  @IsNotEmpty({ message: '토론 카테고리는 투표 설정이 필수입니다.' })
  pollData?: CreatePollDto;

  @IsInt()
  @IsNotEmpty()
  authorId!: number; // 💡 테스트를 위해 임시로 추가
}
