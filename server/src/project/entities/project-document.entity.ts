import { Project } from './project.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProjectDocument {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  docType!: 'REQUIREMENTS' | 'FEATURE_SPEC' | 'DB_SCHEMA' | 'ERD';

  @Column({ type: 'text', default: '' })
  content!: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string | null;

  @Column({ default: 0 })
  sortOrder!: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;
}

