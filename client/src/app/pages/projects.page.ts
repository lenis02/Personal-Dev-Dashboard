import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

type Client = { id: number; name: string; company?: string | null };
type Project = {
  id: number;
  title: string;
  status?: string;
  techStack?: string[];
  client?: Client;
  clientId?: number;
  revenueType?: 'PROFIT' | 'NON_PROFIT';
  contractAmount?: number | null;
  contractMethod?: 'FULL' | 'UPFRONT_BALANCE' | 'MONTHLY_INSTALLMENT' | null;
  upfrontPercent?: number | null;
  contractSignedAt?: string | null;
  endDate?: string | null;
};
type ProjectDocument = {
  id: number;
  title: string;
  docType: 'REQUIREMENTS' | 'FEATURE_SPEC' | 'DB_SCHEMA' | 'ERD';
};

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './projects.page.html',
})
export class ProjectsPage implements OnInit {
  private http = inject(HttpClient);

  clients: Client[] = [];
  projects: Project[] = [];
  expandedProjectId: number | null = null;
  documentsMap: Record<number, ProjectDocument[]> = {};
  documentsLoadingMap: Record<number, boolean> = {};

  isModalOpen = false;
  editingId: number | null = null;
  form: {
    title: string;
    clientId: number | null;
    status: string;
    revenueType: 'PROFIT' | 'NON_PROFIT';
    contractAmount: number | null;
    contractMethod: 'FULL' | 'UPFRONT_BALANCE' | 'MONTHLY_INSTALLMENT';
    upfrontPercent: number | null;
    contractSignedAt: string;
    endDate: string;
  } = {
    title: '',
    clientId: null,
    status: 'ONGOING',
    revenueType: 'PROFIT',
    contractAmount: null as number | null,
    contractMethod: 'FULL',
    upfrontPercent: null as number | null,
    contractSignedAt: '',
    endDate: '',
  };

  ngOnInit() {
    this.fetchClients();
    this.fetchProjects();
  }

  fetchClients() {
    this.http.get<Client[]>('http://localhost:3000/api/client').subscribe({
      next: (data) => (this.clients = data ?? []),
      error: (err) => console.error('클라이언트 목록 로딩 실패', err),
    });
  }

  fetchProjects() {
    this.http.get<Project[]>('http://localhost:3000/api/project').subscribe({
      next: (data) => (this.projects = data ?? []),
      error: (err) => console.error('프로젝트 목록 로딩 실패', err),
    });
  }

  statusClass(status?: string) {
    if (status === 'DONE') return 'bg-green-50 text-green-700';
    if (status === 'PAUSED') return 'bg-gray-100 text-gray-700';
    return 'bg-indigo-50 text-indigo-700';
  }

  getDocTypeLabel(type: ProjectDocument['docType']) {
    if (type === 'REQUIREMENTS') return '요구사항';
    if (type === 'FEATURE_SPEC') return '기능정의';
    if (type === 'DB_SCHEMA') return 'DB스키마';
    return 'ERD';
  }

  toggleExpanded(project: Project) {
    if (this.expandedProjectId === project.id) {
      this.expandedProjectId = null;
      return;
    }
    this.expandedProjectId = project.id;
    if (!this.documentsMap[project.id]) {
      this.fetchProjectDocuments(project.id);
    }
  }

  fetchProjectDocuments(projectId: number) {
    this.documentsLoadingMap[projectId] = true;
    this.http
      .get<ProjectDocument[]>(`http://localhost:3000/api/project/${projectId}/documents`)
      .subscribe({
        next: (data) => {
          this.documentsMap[projectId] = data ?? [];
          this.documentsLoadingMap[projectId] = false;
        },
        error: (err) => {
          console.error('프로젝트 문서 로딩 실패', err);
          this.documentsMap[projectId] = [];
          this.documentsLoadingMap[projectId] = false;
        },
      });
  }

  openCreate() {
    this.editingId = null;
    this.form = {
      title: '',
      clientId: null,
      status: 'ONGOING',
      revenueType: 'PROFIT',
      contractAmount: null,
      contractMethod: 'FULL',
      upfrontPercent: null,
      contractSignedAt: '',
      endDate: '',
    };
    this.isModalOpen = true;
  }

  openEdit(p: Project) {
    this.editingId = p.id;
    this.form = {
      title: p.title ?? '',
      clientId: p.client?.id ?? (p.clientId ?? null),
      status: p.status || 'ONGOING',
      revenueType: p.revenueType || 'PROFIT',
      contractAmount: p.contractAmount ? Number(p.contractAmount) : null,
      contractMethod: p.contractMethod || 'FULL',
      upfrontPercent: p.upfrontPercent ? Number(p.upfrontPercent) : null,
      contractSignedAt: p.contractSignedAt
        ? String(p.contractSignedAt).slice(0, 10)
        : '',
      endDate: p.endDate ? String(p.endDate).slice(0, 10) : '',
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  save() {
    if (!this.form.title.trim()) {
      alert('프로젝트 이름은 필수입니다!');
      return;
    }
    if (!this.form.clientId) {
      alert('담당 클라이언트를 꼭 선택해 주세요!');
      return;
    }

    const payload = {
      title: this.form.title.trim(),
      clientId: Number(this.form.clientId),
      status: this.form.status,
      revenueType: this.form.revenueType,
      contractAmount:
        this.form.revenueType === 'PROFIT' && this.form.contractAmount != null
          ? Number(this.form.contractAmount)
          : undefined,
      contractMethod:
        this.form.revenueType === 'PROFIT' ? this.form.contractMethod : undefined,
      upfrontPercent:
        this.form.revenueType === 'PROFIT' &&
        this.form.contractMethod === 'UPFRONT_BALANCE' &&
        this.form.upfrontPercent != null
          ? Number(this.form.upfrontPercent)
          : undefined,
      contractSignedAt:
        this.form.revenueType === 'PROFIT' && this.form.contractSignedAt
          ? new Date(this.form.contractSignedAt).toISOString()
          : undefined,
      endDate: this.form.endDate
        ? new Date(this.form.endDate).toISOString()
        : undefined,
    };

    const req$ = this.editingId
      ? this.http.patch(`http://localhost:3000/api/project/${this.editingId}`, payload)
      : this.http.post('http://localhost:3000/api/project', payload);

    req$.subscribe({
      next: () => {
        this.closeModal();
        this.fetchProjects();
      },
      error: (err) => {
        console.error('프로젝트 저장 실패', err);
        alert('저장에 실패했습니다.');
      },
    });
  }

  remove(p: Project) {
    if (!confirm(`프로젝트 "${p.title}"를 삭제할까요?`)) return;

    this.http.delete(`http://localhost:3000/api/project/${p.id}`).subscribe({
      next: () => this.fetchProjects(),
      error: (err) => {
        console.error('프로젝트 삭제 실패', err);
        alert('삭제에 실패했습니다.');
      },
    });
  }
}

