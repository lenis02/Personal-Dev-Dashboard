import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Project = { id: number; title: string; client?: { name: string } };
type Task = {
  id: number;
  content: string;
  isDone: boolean;
  status: string;
  dueDate?: string | null;
  project?: Project;
};

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-1 p-8 overflow-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">할 일 (Tasks)</h2>
          <p class="text-sm text-gray-500 mt-1">프로젝트별 할 일을 관리하세요.</p>
        </div>
        <button
          (click)="openCreate()"
          class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white px-4 py-2 text-sm font-bold shadow-md transition cursor-pointer"
        >
          + 할 일 추가
        </button>
      </div>

      <div class="mb-4 flex items-center gap-3">
        <select
          [(ngModel)]="filterProjectId"
          (ngModelChange)="fetchTasks()"
          class="px-3 py-2 border border-gray-300 bg-white text-sm"
        >
          <option [ngValue]="null">전체 프로젝트</option>
          <option *ngFor="let p of projects" [ngValue]="p.id">{{ p.title }}</option>
        </select>

        <label class="inline-flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" [(ngModel)]="hideCompleted" (change)="applyClientFilter()" />
          완료 숨기기
        </label>
      </div>

      <div
        *ngIf="visibleTasks.length === 0"
        class="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-gray-200 text-gray-400"
      >
        <p>표시할 할 일이 없습니다.</p>
      </div>

      <div
        *ngIf="visibleTasks.length > 0"
        class="bg-white/90 border border-gray-100 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-bold text-gray-500">
          <div class="col-span-1">완료</div>
          <div class="col-span-5">할 일</div>
          <div class="col-span-3">프로젝트</div>
          <div class="col-span-2">기한</div>
          <div class="col-span-1 text-right">관리</div>
        </div>

        <div
          *ngFor="let t of visibleTasks"
          class="grid grid-cols-12 gap-4 px-6 py-4 border-t border-gray-100 items-center"
        >
          <div class="col-span-1">
            <input type="checkbox" [checked]="t.isDone" (change)="toggleDone(t)" />
          </div>
          <div class="col-span-5">
            <div class="font-semibold text-gray-800" [ngClass]="{ 'line-through text-gray-400': t.isDone }">
              {{ t.content }}
            </div>
            <div class="text-xs mt-1">
              <span
                class="inline-flex items-center px-2 py-1 text-[11px] font-bold"
                [ngClass]="statusClass(t.status)"
              >
                {{ t.status }}
              </span>
              <span *ngIf="t.project?.client?.name" class="text-gray-400 ml-2">
                {{ t.project?.client?.name }}
              </span>
            </div>
          </div>
          <div class="col-span-3 text-gray-600">{{ t.project?.title || '-' }}</div>
          <div class="col-span-2 text-gray-600">{{ formatDueDate(t.dueDate) }}</div>
          <div class="col-span-1 flex justify-end gap-2">
            <button
              (click)="openEdit(t)"
              class="px-2 py-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
            >
              수정
            </button>
            <button
              (click)="remove(t)"
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
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800">
            {{ editingId ? '할 일 수정' : '새 할 일(Task) 추가' }}
          </h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-red-500 font-bold text-xl cursor-pointer">
            &times;
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1"
              >담당 프로젝트 <span class="text-red-500">*</span></label
            >
            <select
              [(ngModel)]="form.projectId"
              class="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option [ngValue]="null" disabled>어떤 프로젝트의 할 일인가요?</option>
              <option *ngFor="let p of projects" [ngValue]="p.id">{{ p.title }}</option>
            </select>
            <p *ngIf="projects.length === 0" class="text-xs text-red-500 mt-1">
              프로젝트를 먼저 만들어야 합니다.
            </p>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1"
              >할 일 내용 <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              [(ngModel)]="form.content"
              placeholder="예: 메인 페이지 UI 퍼블리싱"
              class="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">마감 기한 (옵션)</label>
            <input
              type="datetime-local"
              [(ngModel)]="form.dueDateLocal"
              class="w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div *ngIf="editingId" class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="form.isDone" />
            <span class="text-sm text-gray-700">완료 처리</span>
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
            class="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 shadow-md transition cursor-pointer"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  `,
})
export class TasksPage implements OnInit {
  private http = inject(HttpClient);

  projects: Project[] = [];
  tasks: Task[] = [];
  visibleTasks: Task[] = [];

  filterProjectId: number | null = null;
  hideCompleted = false;

  isModalOpen = false;
  editingId: number | null = null;
  form: {
    content: string;
    projectId: number | null;
    dueDateLocal: string;
    isDone: boolean;
  } = { content: '', projectId: null, dueDateLocal: '', isDone: false };

  ngOnInit() {
    this.fetchProjects();
    this.fetchTasks();
  }

  fetchProjects() {
    this.http.get<Project[]>('http://localhost:3000/api/project').subscribe({
      next: (data) => (this.projects = data ?? []),
      error: (err) => console.error('프로젝트 목록 로딩 실패', err),
    });
  }

  fetchTasks() {
    const qs =
      this.filterProjectId != null ? `?projectId=${this.filterProjectId}` : '';
    this.http.get<Task[]>(`http://localhost:3000/api/task${qs}`).subscribe({
      next: (data) => {
        this.tasks = data ?? [];
        this.applyClientFilter();
      },
      error: (err) => console.error('할 일 목록 로딩 실패', err),
    });
  }

  applyClientFilter() {
    this.visibleTasks = this.hideCompleted
      ? this.tasks.filter((t) => !t.isDone)
      : [...this.tasks];
  }

  statusClass(status: string) {
    if (status === 'COMPLETED') return 'bg-green-50 text-green-700';
    if (status === 'OVERDUE') return 'bg-red-50 text-red-700';
    return 'bg-orange-50 text-orange-700';
  }

  formatDueDate(dueDate?: string | null) {
    if (!dueDate) return '-';
    const d = new Date(dueDate);
    if (Number.isNaN(d.getTime())) return '-';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  }

  openCreate() {
    this.editingId = null;
    this.form = { content: '', projectId: null, dueDateLocal: '', isDone: false };
    this.isModalOpen = true;
  }

  openEdit(t: Task) {
    this.editingId = t.id;
    this.form = {
      content: t.content ?? '',
      projectId: t.project?.id ?? null,
      dueDateLocal: t.dueDate ? this.toLocalInputValue(t.dueDate) : '',
      isDone: !!t.isDone,
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  toLocalInputValue(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  save() {
    if (!this.form.content.trim()) {
      alert('할 일 내용을 적어주세요!');
      return;
    }
    if (!this.form.projectId) {
      alert('어떤 프로젝트의 할 일인지 선택해 주세요!');
      return;
    }

    const payload: any = {
      content: this.form.content.trim(),
      projectId: Number(this.form.projectId),
      dueDate: this.form.dueDateLocal
        ? new Date(this.form.dueDateLocal).toISOString()
        : undefined,
    };

    if (this.editingId) {
      payload.isDone = this.form.isDone;
    }

    const req$ = this.editingId
      ? this.http.patch(`http://localhost:3000/api/task/${this.editingId}`, payload)
      : this.http.post('http://localhost:3000/api/task', payload);

    req$.subscribe({
      next: () => {
        this.closeModal();
        this.fetchTasks();
      },
      error: (err) => {
        console.error('할 일 저장 실패', err);
        alert('저장에 실패했습니다.');
      },
    });
  }

  toggleDone(t: Task) {
    this.http
      .patch(`http://localhost:3000/api/task/${t.id}`, { isDone: !t.isDone })
      .subscribe({
        next: () => this.fetchTasks(),
        error: (err) => {
          console.error('할 일 상태 변경 실패', err);
          alert('상태 변경에 실패했습니다.');
        },
      });
  }

  remove(t: Task) {
    if (!confirm(`할 일을 삭제할까요?\n\n"${t.content}"`)) return;
    this.http.delete(`http://localhost:3000/api/task/${t.id}`).subscribe({
      next: () => this.fetchTasks(),
      error: (err) => {
        console.error('할 일 삭제 실패', err);
        alert('삭제에 실패했습니다.');
      },
    });
  }
}

