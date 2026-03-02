import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // 게시글 추가
  @Post('')
  async create(@Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(createPostDto, createPostDto.authorId);
  }

  // 게시글 수정
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: Partial<CreatePostDto>
  ) {
    return this.postService.updatePost(id, updatePostDto);
  }

  // 게시글 삭제
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.postService.deletePost(id);
    return { message: '게시글 삭제 완료' };
  }
}
