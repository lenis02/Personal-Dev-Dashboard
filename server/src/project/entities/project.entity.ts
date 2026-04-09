import { Client } from "../../client/entities/client.entity";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  // 프로젝트 제목
  @Column()
  title!: string;

  // 기술 스택
  @Column('simple-array', { nullable: true })
  techStack?: string[];

  // 상태
  @Column({ default: 'ONGOING' })
  status?: string;

  // 영리 / 비영리 구분
  @Column({ type: 'varchar', default: 'PROFIT' })
  revenueType!: 'PROFIT' | 'NON_PROFIT';

  // 계약 금액
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  contractAmount?: number | null;

  // 계약 금액 지불 방식 (한 번에 / 선 수금 ~% / 월별 지급)
  @Column({ type: 'varchar', nullable: true })
  contractMethod?: 'FULL' | 'UPFRONT_BALANCE' | 'MONTHLY_INSTALLMENT' | null;

  // 선 수금 방식 시 지급 비율
  @Column({ type: 'float', nullable: true })
  upfrontPercent?: number | null;

  // 계약 일자
  @Column({ type: 'timestamp', nullable: true })
  contractSignedAt?: Date | null;

  // 시작 일시
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  startDate!: Date;

  // 완료 일시
  @Column({ type:'timestamp', nullable: true})
  endDate!: Date;


  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Client, {onDelete: 'CASCADE'})
  client!: Client;
}
