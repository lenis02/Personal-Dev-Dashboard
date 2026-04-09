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
  templateUrl: './tasks.page.html',
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

