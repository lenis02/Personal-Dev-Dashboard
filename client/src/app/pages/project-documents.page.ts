import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

type ProjectDocument = {
  id: number;
  title: string;
  docType: 'REQUIREMENTS' | 'FEATURE_SPEC' | 'DB_SCHEMA' | 'ERD';
  content: string;
  imageUrl?: string | null;
};

@Component({
  selector: 'app-project-documents-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-documents.page.html',
})
export class ProjectDocumentsPage implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  projectId: number | null = null;
  documents: ProjectDocument[] = [];
  selectedDocId: number | null = null;
  markdownPreview: SafeHtml = '';

  get selectedDoc() {
    return this.documents.find((d) => d.id === this.selectedDocId) ?? null;
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.projectId = id;
    this.fetchDocuments();
  }

  fetchDocuments() {
    if (!this.projectId) return;
    this.http
      .get<ProjectDocument[]>(`http://localhost:3000/api/project/${this.projectId}/documents`)
      .subscribe({
        next: (data) => {
          this.documents = data ?? [];
          const queryDocId = Number(this.route.snapshot.queryParamMap.get('docId'));
          const defaultDocId = this.documents[0]?.id ?? null;
          const nextDocId = this.documents.some((d) => d.id === queryDocId)
            ? queryDocId
            : defaultDocId;
          if (nextDocId) {
            this.selectDoc(nextDocId, false);
          }
        },
        error: (err) => console.error('문서 목록 로딩 실패', err),
      });
  }

  selectDoc(docId: number, updateQuery = true) {
    this.selectedDocId = docId;
    const doc = this.documents.find((d) => d.id === docId);
    this.updatePreview(doc?.content ?? '');
    if (updateQuery && this.projectId) {
      this.router.navigate(['/projects', this.projectId, 'documents'], {
        queryParams: { docId },
      });
    }
  }

  updatePreview(content: string) {
    const html = marked.parse(content || '', { async: false }) as string;
    this.markdownPreview = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  saveDocument(doc: ProjectDocument) {
    if (!this.projectId) return;
    this.http
      .patch(
        `http://localhost:3000/api/project/${this.projectId}/documents/${doc.id}`,
        {
          title: doc.title,
          content: doc.content,
          imageUrl: doc.docType === 'ERD' ? doc.imageUrl || undefined : undefined,
        }
      )
      .subscribe({
        next: () => {
          this.updatePreview(doc.content);
        },
        error: (err) => {
          console.error('문서 저장 실패', err);
          alert('문서 저장에 실패했습니다.');
        },
      });
  }
}

