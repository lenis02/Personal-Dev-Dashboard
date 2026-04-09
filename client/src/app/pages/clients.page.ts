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
  templateUrl: './clients.page.html',
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

