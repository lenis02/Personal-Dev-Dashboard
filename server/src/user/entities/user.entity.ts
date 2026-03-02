import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['provider', 'socialId']) // 중복 확인
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  email?: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  height?: number;

  @Column({ nullable: true })
  weight?: number;

  @Column({ nullable: true })
  SBD?: number;

  @Column()
  provider!: string;

  @Column()
  socialId!: string;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
