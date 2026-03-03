import { Poll } from '../../poll/entities/poll.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PostCategory {
  WORKOUT = 'WORKOUT',
  DEBATE = 'DEBATE',
  NOTICE = 'NOTICE',
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: PostCategory,
    default: PostCategory.WORKOUT,
  })
  category!: PostCategory;

  @Column()
  title!: string;

  @Column()
  content!: string;

  // 카테고리가 DEBATE인 경우 투표
  @OneToOne(() => Poll, (poll) => poll.post)
  poll?: Poll;

  @Column({ nullable: true })
  imageUrl?: string;

  // 게시글: 유저 = N:1의 관계 설정, CASCADE로 게시물 자동 삭제
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column()
  authorId!: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
