import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Client = {
  id: number;
  name: string;
  company?: string | null;
  email?: string | null;
};

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex-1 p-8 overflow-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">클라이언트</h2>
          <p class="text-sm text-gray-500 mt-1">고객 정보를 관리하세요.</p>
        </div>
        <button
          (click)="openCreate()"
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition"
        >
          + 클라이언트 추가
        </button>
      </div>

      <div
        *ngIf="clients.length === 0"
        class="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400"
      >
        <p>아직 등록된 클라이언트가 없습니다.</p>
      </div>

      <div
        *ngIf="clients.length > 0"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-bold text-gray-500">
          <div class="col-span-4">담당자</div>
          <div class="col-span-4">회사</div>
          <div class="col-span-3">이메일</div>
          <div class="col-span-1 text-right">관리</div>
        </div>

        <div
          *ngFor="let c of clients"
          class="grid grid-cols-12 gap-4 px-6 py-4 border-t border-gray-100 items-center"
        >
          <div class="col-span-4 font-semibold text-gray-800">{{ c.name }}</div>
          <div class="col-span-4 text-gray-600">{{ c.company || '-' }}</div>
          <div class="col-span-3 text-gray-600">{{ c.email || '-' }}</div>
          <div class="col-span-1 flex justify-end gap-2">
            <button
              (click)="openEdit(c)"
              class="px-2 py-1 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              수정
            </button>
            <button
              (click)="remove(c)"
              class="px-2 py-1 text-xs font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-700"
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
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div
          class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center"
        >
          <h3 class="text-lg font-bold text-gray-800">
            {{ editingId ? '클라이언트 수정' : '새 클라이언트 등록' }}
          </h3>
          <button
            (click)="closeModal()"
            class="text-gray-400 hover:text-red-500 font-bold text-xl"
          >
            &times;
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1"
              >담당자 이름 <span class="text-red-500">*</span></label
            >
            <input
              type="text"
              [(ngModel)]="form.name"
              placeholder="예: 김원영"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">회사명</label>
            <input
              type="text"
              [(ngModel)]="form.company"
              placeholder="예: 씰룩 코퍼레이션"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">이메일 연락처</label>
            <input
              type="email"
              [(ngModel)]="form.email"
              placeholder="예: contact@selu.com"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            (click)="closeModal()"
            class="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            취소
          </button>
          <button
            (click)="save()"
            class="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md transition"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ClientsPage implements OnInit {
  private http = inject(HttpClient);

  clients: Client[] = [];

  isModalOpen = false;
  editingId: number | null = null;
  form: { name: string; company: string; email: string } = {
    name: '',
    company: '',
    email: '',
  };

  ngOnInit() {
    this.fetchClients();
  }

  fetchClients() {
    this.http.get<Client[]>('http://localhost:3000/api/client').subscribe({
      next: (data) => (this.clients = data ?? []),
      error: (err) => console.error('클라이언트 목록 로딩 실패', err),
    });
  }

  openCreate() {
    this.editingId = null;
    this.form = { name: '', company: '', email: '' };
    this.isModalOpen = true;
  }

  openEdit(c: Client) {
    this.editingId = c.id;
    this.form = {
      name: c.name ?? '',
      company: (c.company as any) ?? '',
      email: (c.email as any) ?? '',
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  save() {
    if (!this.form.name.trim()) {
      alert('클라이언트 이름은 필수입니다!');
      return;
    }

    const payload = {
      name: this.form.name.trim(),
      company: this.form.company?.trim() || undefined,
      email: this.form.email?.trim() || undefined,
    };

    const req$ = this.editingId
      ? this.http.patch(`http://localhost:3000/api/client/${this.editingId}`, payload)
      : this.http.post('http://localhost:3000/api/client', payload);

    req$.subscribe({
      next: () => {
        this.closeModal();
        this.fetchClients();
      },
      error: (err) => {
        console.error('클라이언트 저장 실패', err);
        alert('저장에 실패했습니다.');
      },
    });
  }

  remove(c: Client) {
    if (!confirm(`클라이언트 "${c.name}"를 삭제할까요?`)) return;

    this.http.delete(`http://localhost:3000/api/client/${c.id}`).subscribe({
      next: () => this.fetchClients(),
      error: (err) => {
        console.error('클라이언트 삭제 실패', err);
        alert('삭제에 실패했습니다.');
      },
    });
  }
}

