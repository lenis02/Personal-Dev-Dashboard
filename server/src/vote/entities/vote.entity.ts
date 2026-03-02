import { PollOption } from 'server/src/polloption/entities/polloption.entity';
import { User } from 'server/src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['userId', 'pollId']) // 한 유저는 투표 한 번만
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => PollOption, (option) => option.votes)
  option!: PollOption;

  @Column()
  optionId!: number;

  @Column()
  pollId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
