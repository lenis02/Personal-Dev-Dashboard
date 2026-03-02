import { PollOption } from 'server/src/polloption/entities/polloption.entity';
import { Post } from 'server/src/post/entity/post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Poll {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  // 1대1 관계 및 CASCADE 옵션
  @OneToOne(() => Post, (post) => post.poll, { onDelete: 'CASCADE' })
  @JoinColumn()
  post!: Post;

  @Column()
  postId!: number;

  @OneToMany(() => PollOption, (option) => option.poll, { cascade: true })
  options!: PollOption[];

  @CreateDateColumn()
  createdAt!: Date;
}
