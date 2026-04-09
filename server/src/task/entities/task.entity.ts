import { Project } from '../../project/entities/project.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  content!: string;

  @Column({ default: false })
  isDone!: boolean;

  @Column({ default: 'PENDING' }) // PENDING, COMPLETED, OVERDUE
  status!: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;
}
