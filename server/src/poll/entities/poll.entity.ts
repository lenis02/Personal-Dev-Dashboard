import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entity/post.entity';
import type { Relation } from 'typeorm';

export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => PollOption, (option) => option.votes)
  option!: Relation<PollOption>;

  @Column()
  optionId!: number;

  @Column()
  pollId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity()
export class PollOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  text!: string;

  @ManyToOne(() => Poll, (poll) => poll.options)
  poll!: Relation<Poll>;

  @OneToMany(() => Vote, (vote) => vote.option)
  votes!: Relation<Vote>[];
}

@Entity()
export class Poll {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  // 1대1 관계 및 CASCADE 옵션
  @OneToOne(() => Post, (post) => post.poll, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post!: Relation<Post>;

  @Column()
  postId!: number;

  @OneToMany(() => PollOption, (option) => option.poll, { cascade: true })
  options!: Relation<PollOption>[];

  @CreateDateColumn()
  createdAt!: Date;
}
