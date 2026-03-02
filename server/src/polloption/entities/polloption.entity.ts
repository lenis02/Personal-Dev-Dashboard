import { Poll } from 'server/src/poll/entities/poll.entity';
import { Vote } from 'server/src/vote/entities/vote.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PollOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  text!: string;

  @ManyToOne(() => Poll, (poll) => poll.options)
  poll!: Poll;

  @OneToMany(() => Vote, (vote) => vote.option)
  votes!: Vote[];
}
