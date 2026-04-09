import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  private http = inject(HttpClient);

  dashboardData: any = null;

  ngOnInit() {
    this.fetchDashboardSummary();
  }

  fetchDashboardSummary() {
    this.http.get('http://localhost:3000/api/dashboard/summary').subscribe({
      next: (data) => {
        this.dashboardData = data;
      },
      error: (err) => {
        console.error('대시보드 요약 로딩 실패', err);
      },
    });
  }
}

