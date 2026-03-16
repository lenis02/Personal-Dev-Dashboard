import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  name!: string;

  @Column()
  socialId!: string;

  @Column()
  provider!: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string | null;
}
