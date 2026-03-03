import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostCategory } from './entity/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { PollService } from '../poll/poll.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private pollService: PollService,
    private dataSource: DataSource
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
    // 트랜젝션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newPost = this.postRepository.create({
        ...createPostDto,
        authorId,
      });
      const savedPost = await queryRunner.manager.save(newPost);

      if (
        createPostDto.category === PostCategory.DEBATE &&
        createPostDto.pollData
      ) {
        await this.pollService.createPoll(
          savedPost.id,
          createPostDto.pollData,
          queryRunner.manager
        );
      }
      await queryRunner.commitTransaction();
      return savedPost;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
      relations: ['author', 'poll', 'poll.options'],
    });

    if (!post) {
      throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
    }
    return post;
  }
}
