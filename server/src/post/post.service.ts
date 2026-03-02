import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from './entity/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>
  ) {}

  // 게시글 조회
  async findById(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
    }
    return post;
  }

  // 게시글 생성
  async createPost(
    createPostDto: CreatePostDto,
    authorId: number
  ): Promise<Post> {
    const newPost = this.postRepository.create({
      ...createPostDto,
      authorId,
    });
    return await this.postRepository.save(newPost);
  }

  // 게시글 수정
  async updatePost(
    id: number, // 게시글 아이디,
    updatePostDto: Partial<CreatePostDto>
  ): Promise<Post> {
    const post = await this.findById(id);

    Object.assign(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  // 게시글 삭제
  async deletePost(id: number): Promise<void> {
    const res = await this.postRepository.delete(id);

    // 삭제된 게시글이 없을 경우
    if (res.affected === 0) {
      throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
    }
  }

  // 게시글 상세 조회
  async getPostById(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
    }
    return post;
  }
}
