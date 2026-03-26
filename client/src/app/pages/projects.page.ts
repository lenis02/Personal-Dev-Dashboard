import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Client = { id: number; name: string; company?: string | null };
type Project = {
  id: number;
  title: string;
  status?: string;
  techStack?: string[];
  client?: Client;
  clientId?: number;
};

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-1 p-8 overflow-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">프로젝트</h2>
          <p class="text-sm text-gray-500 mt-1">프로젝트 현황과 정보를 관리하세요.</p>
        </div>
        <button
          (click)="openCreate()"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white px-4 py-2 text-sm font-bold shadow-md transition cursor-pointer"
        >
          + 프로젝트 생성
        </button>
      </div>

      <div
        *ngIf="projects.length === 0"
        class="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-gray-200 text-gray-400"
      >
        <p>아직 등록된 프로젝트가 없습니다.</p>
      </div>

      <div
        *ngIf="projects.length > 0"
        class="bg-white/90 border border-gray-100 shadow-sm overflow-hidden"
      >
        <div
          class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-bold text-gray-500"
        >
          <div class="col-span-4">프로젝트명</div>
          <div class="col-span-3">클라이언트</div>
          <div class="col-span-3">상태</div>
          <div class="col-span-2 text-right">관리</div>
        </div>

        <div
          *ngFor="let p of projects"
          class="grid grid-cols-12 gap-4 px-6 py-4 border-t border-gray-100 items-center"
        >
          <div class="col-span-4 font-semibold text-gray-800">{{ p.title }}</div>
          <div class="col-span-3 text-gray-600">
            {{ p.client?.name || '-' }}
            <span *ngIf="p.client?.company" class="text-gray-400"
              >({{ p.client?.company }})</span
            >
          </div>
          <div class="col-span-3">
            <span
              class="inline-flex items-center px-2 py-1 text-xs font-bold"
              [ngClass]="statusClass(p.status)"
            >
              {{ p.status || 'ONGOING' }}
            </span>
          </div>
          <div class="col-span-2 flex justify-end gap-2">
            <button
              (click)="openEdit(p)"
              class="px-2 py-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
            >
              수정
            </button>
            <button
              (click)="remove(p)"
              class="px-2 py-1 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 cursor-pointer"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      *ngIf="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
    >
      <div class="bg-white shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        <div
          class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center"
        >
          <h3 class="text-lg font-bold text-gray-800">
            {{ editingId ? '프로젝트 수정' : '새 프로젝트 시작' }}
          </h3>
          <button
            (click)="closeModal()"
            class="text-gray-400 hover:text-red-500 font-bold text-xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1"
              >담당 클라이언트 <span class="text-red-500">*</span></label
            >
            <select
              [(ngModel)]="form.clientId"
              class="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option [ngValue]="null" disabled>클라이언트를 선택해 주세요</option>
              <option *ngFor="let c of clients" [ngValue]="c.id">
                {{ c.name }} <span *ngIf="c.company">({{ c.company }})</span>
              </option>
            </select>
            <p *ngIf="clients.length === 0" class="text-xs text-red-500 mt-1">
              먼저 클라이언트를 추가해야 프로젝트를 만들 수 있습니다!
            </p>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1"
              >프로젝트명 <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              [(ngModel)]="form.title"
              placeholder="예: 씰룩 웹사이트 구축"
              class="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">상태</label>
            <select
              [(ngModel)]="form.status"
              class="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ONGOING">ONGOING</option>
              <option value="DONE">DONE</option>
              <option value="PAUSED">PAUSED</option>
            </select>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            (click)="closeModal()"
            class="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition cursor-pointer"
          >
            취소
          </button>
          <button
            (click)="save()"
            class="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-md transition cursor-pointer"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProjectsPage implements OnInit {
  private http = inject(HttpClient);

  clients: Client[] = [];
  projects: Project[] = [];

  isModalOpen = false;
  editingId: number | null = null;
  form: { title: string; clientId: number | null; status: string } = {
    title: '',
    clientId: null,
    status: 'ONGOING',
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

  openCreate() {
    this.editingId = null;
    this.form = { title: '', clientId: null, status: 'ONGOING' };
    this.isModalOpen = true;
  }

  openEdit(p: Project) {
    this.editingId = p.id;
    this.form = {
      title: p.title ?? '',
      clientId: p.client?.id ?? (p.clientId ?? null),
      status: p.status || 'ONGOING',
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

