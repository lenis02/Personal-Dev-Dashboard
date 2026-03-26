import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 p-8 overflow-auto">
      <div
        *ngIf="dashboardData"
        class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div
          class="bg-white/90 p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-gray-500 text-sm font-semibold">총 클라이언트</h3>
            <span class="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 text-xs">Clients</span>
          </div>
          <p class="text-4xl font-bold text-gray-800">
            {{ dashboardData?.totalClients || 0
            }}<span class="text-lg font-normal text-gray-500 ml-1">명</span>
          </p>
        </div>

        <div
          class="bg-white/90 p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-gray-500 text-sm font-semibold">진행 중인 프로젝트</h3>
            <span class="p-2 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-600 text-xs">Projects</span>
          </div>
          <p class="text-4xl font-bold text-indigo-600">
            {{ dashboardData?.ongoingProjects || 0
            }}<span class="text-lg font-normal text-gray-500 ml-1">건</span>
          </p>
        </div>

        <div
          class="bg-white/90 p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
        >
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-gray-500 text-sm font-semibold">남은 할 일</h3>
            <span class="p-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 text-xs">Tasks</span>
          </div>
          <p class="text-4xl font-bold text-orange-500">
            {{ dashboardData?.pendingTasks || 0
            }}<span class="text-lg font-normal text-gray-500 ml-1">개</span>
          </p>
        </div>
      </div>

      <div
        *ngIf="!dashboardData"
        class="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-gray-200 text-gray-400"
      >
        <p>서버에서 데이터를 불러오고 있습니다...</p>
      </div>
    </div>
  `,
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

