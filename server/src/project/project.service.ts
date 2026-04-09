import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { UpdateProjectDocumentDto } from './dto/update-project-document.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(ProjectDocument)
    private projectDocumentRepository: Repository<ProjectDocument>
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: number) {
    const { clientId, ...projectData } = createProjectDto;

    const newProject = this.projectRepository.create({
      ...projectData,
      status: projectData.status ?? 'ONGOING',
      revenueType: projectData.revenueType ?? 'PROFIT',
      user: { id: userId },
      client: { id: clientId },
    });

    const insertResult = await this.projectRepository.insert(newProject);
    const savedProjectId = insertResult.identifiers?.[0]?.['id'];
    const savedProject = await this.projectRepository.findOne({
      where: { id: savedProjectId, user: { id: userId } },
      relations: ['client'],
    });
    if (!savedProject) {
      throw new NotFoundException('생성된 프로젝트를 찾을 수 없습니다.');
    }
    await this.createDefaultDocuments(savedProject.id);
    return savedProject;
  }

  async findAll(userId: number) {
    return await this.projectRepository.find({
      where: { user: { id: userId } },
      relations: ['client'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!project) {
      throw new NotFoundException(
        `해당 프로젝트(ID: ${id})를 찾을 수 없거나 권한이 없습니다.`
      );
    }
    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number) {
    const project = await this.findOne(id, userId);

    const UpdatedProject = Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(UpdatedProject);
  }

  async remove(id: number, userId: number) {
    const project = await this.findOne(id, userId);
    await this.projectRepository.remove(project);

    return { message: `프로젝트(ID:${id})를 성공적으로 삭제했습니다.` };
  }

  private async createDefaultDocuments(projectId: number) {
    const templates: Array<{
      title: string;
      docType: ProjectDocument['docType'];
      content: string;
      sortOrder: number;
    }> = [
      {
        title: '고객 요구사항 정의서',
        docType: 'REQUIREMENTS',
        content:
          '# 고객 요구사항 정의서\n\n- 프로젝트 목표:\n- 핵심 사용자:\n- 주요 요구사항:\n- 우선순위:\n- 비고:\n',
        sortOrder: 1,
      },
      {
        title: '기능 정의서',
        docType: 'FEATURE_SPEC',
        content:
          '| 권한 | API 포인트 | 기능 이름 | HTTP 메서드 | 기능 설명 | 기능 정책 | 진행상황 |\n|---|---|---|---|---|---|---|\n| ADMIN | /api/example | 예시 기능 | GET | 설명 입력 | 정책 입력 | TODO |\n',
        sortOrder: 2,
      },
      {
        title: 'DB 스키마 정의 문서',
        docType: 'DB_SCHEMA',
        content:
          '# DB 스키마 정의\n\n- 엔티티 목록:\n- 주요 관계:\n- 인덱스/제약조건:\n- 마이그레이션 메모:\n',
        sortOrder: 3,
      },
      {
        title: 'ERD 문서',
        docType: 'ERD',
        content:
          '# ERD\n\n아래 이미지 URL 또는 링크를 입력해 관리합니다.\n\n- 버전:\n- 변경 이력:\n',
        sortOrder: 4,
      },
    ];

    await this.projectDocumentRepository.insert(
      templates.map((t) => ({
        ...t,
        project: { id: projectId },
      }))
    );
  }

  async getDocuments(projectId: number, userId: number) {
    await this.findOne(projectId, userId);
    let documents = await this.projectDocumentRepository.find({
      where: { project: { id: projectId } },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    if (documents.length === 0) {
      await this.createDefaultDocuments(projectId);
      documents = await this.projectDocumentRepository.find({
        where: { project: { id: projectId } },
        order: { sortOrder: 'ASC', id: 'ASC' },
      });
    }

    return documents;
  }

  async updateDocument(
    projectId: number,
    documentId: number,
    dto: UpdateProjectDocumentDto,
    userId: number
  ) {
    await this.findOne(projectId, userId);
    const document = await this.projectDocumentRepository.findOne({
      where: { id: documentId, project: { id: projectId } },
    });
    if (!document) {
      throw new NotFoundException(`문서(ID: ${documentId})를 찾을 수 없습니다.`);
    }
    const updated = Object.assign(document, dto);
    return await this.projectDocumentRepository.save(updated);
  }

  private toMonthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private monthStart(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private monthsBetweenInclusive(start: Date, end: Date) {
    const results: Date[] = [];
    let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= endMonth) {
      results.push(new Date(cursor));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return results;
  }

  private generateSettlementEntries(project: Project) {
    if (project.revenueType !== 'PROFIT') return [];

    const amount = Number(project.contractAmount ?? 0);
    if (!amount || amount <= 0) return [];

    const signedAt = project.contractSignedAt
      ? new Date(project.contractSignedAt)
      : project.startDate
        ? new Date(project.startDate)
        : new Date();

    const signedMonth = this.monthStart(signedAt);
    const completionMonth = project.endDate
      ? this.monthStart(new Date(project.endDate))
      : signedMonth;
    const endMonth = completionMonth < signedMonth ? signedMonth : completionMonth;

    const method = project.contractMethod ?? 'FULL';
    const entries: Array<{ month: string; amount: number }> = [];

    if (method === 'FULL') {
      entries.push({ month: this.toMonthKey(endMonth), amount });
    } else if (method === 'UPFRONT_BALANCE') {
      const upfrontPercent = Number(project.upfrontPercent ?? 0);
      const upfront = Math.round((amount * upfrontPercent) / 100);
      const balance = amount - upfront;
      entries.push({ month: this.toMonthKey(signedMonth), amount: upfront });
      entries.push({ month: this.toMonthKey(endMonth), amount: balance });
    } else {
      const months = this.monthsBetweenInclusive(signedMonth, endMonth);
      const perMonth = Math.floor(amount / months.length);
      const remainder = amount - perMonth * months.length;

      months.forEach((m, idx) => {
        entries.push({
          month: this.toMonthKey(m),
          amount: perMonth + (idx === months.length - 1 ? remainder : 0),
        });
      });
    }

    return entries.map((e) => ({
      month: e.month,
      amount: e.amount,
      projectId: project.id,
      projectTitle: project.title,
      clientName: project.client?.name ?? '-',
    }));
  }

  async getRevenueSummary(userId: number, months = 12) {
    const projects = await this.projectRepository.find({
      where: { user: { id: userId } },
      relations: ['client'],
      order: { id: 'DESC' },
    });

    const allEntries = projects.flatMap((project) =>
      this.generateSettlementEntries(project)
    );

    const now = new Date();
    const monthKeys: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push(this.toMonthKey(d));
    }

    const totalsByMonth = monthKeys.map((month) => ({
      month,
      totalRevenue: allEntries
        .filter((entry) => entry.month === month)
        .reduce((sum, entry) => sum + entry.amount, 0),
    }));

    return {
      months: totalsByMonth,
      totalRevenue: totalsByMonth.reduce((sum, m) => sum + m.totalRevenue, 0),
    };
  }

  async getRevenueByMonth(userId: number, month: string) {
    const projects = await this.projectRepository.find({
      where: { user: { id: userId } },
      relations: ['client'],
      order: { id: 'DESC' },
    });

    const rows = projects
      .flatMap((project) => this.generateSettlementEntries(project))
      .filter((entry) => entry.month === month)
      .map((entry) => ({
        clientName: entry.clientName,
        projectTitle: entry.projectTitle,
        revenue: entry.amount,
      }));

    return {
      month,
      rows,
      totalRevenue: rows.reduce((sum, row) => sum + row.revenue, 0),
    };
  }
}
