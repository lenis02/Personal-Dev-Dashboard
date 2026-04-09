import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

type RevenueMonth = {
  month: string;
  totalRevenue: number;
};

type RevenueSummaryResponse = {
  months: RevenueMonth[];
  totalRevenue: number;
};

type RevenueMonthRow = {
  clientName: string;
  projectTitle: string;
  revenue: number;
};

type RevenueMonthResponse = {
  month: string;
  rows: RevenueMonthRow[];
  totalRevenue: number;
};

@Component({
  selector: 'app-revenue-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revenue.page.html',
})
export class RevenuePage implements OnInit {
  private http = inject(HttpClient);

  months: RevenueMonth[] = [];
  selectedMonth = '';
  rows: RevenueMonthRow[] = [];
  totalRevenue = 0;
  monthTotalRevenue = 0;

  ngOnInit() {
    this.fetchSummary();
  }

  fetchSummary() {
    this.http
      .get<RevenueSummaryResponse>('http://localhost:3000/api/project/revenue/summary?months=12')
      .subscribe({
        next: (data) => {
          this.months = data.months ?? [];
          this.totalRevenue = data.totalRevenue ?? 0;
          if (this.months.length > 0) {
            this.selectMonth(this.months[this.months.length - 1].month);
          }
        },
        error: (err) => console.error('정산 요약 로딩 실패', err),
      });
  }

  selectMonth(month: string) {
    this.selectedMonth = month;
    this.http
      .get<RevenueMonthResponse>(
        `http://localhost:3000/api/project/revenue/month?month=${month}`
      )
      .subscribe({
        next: (data) => {
          this.rows = data.rows ?? [];
          this.monthTotalRevenue = data.totalRevenue ?? 0;
        },
        error: (err) => {
          console.error('월별 정산 로딩 실패', err);
          this.rows = [];
          this.monthTotalRevenue = 0;
        },
      });
  }

  getBarHeight(value: number) {
    const max = Math.max(...this.months.map((m) => m.totalRevenue), 1);
    return Math.max(4, (value / max) * 100);
  }

  compactMoney(value: number) {
    if (value >= 100000000) return `${Math.floor(value / 100000000)}억`;
    if (value >= 10000) return `${Math.floor(value / 10000)}만`;
    return `${Math.floor(value)}`;
  }

  formatWon(value: number) {
    return `${Number(value || 0).toLocaleString('ko-KR')}원`;
  }
}

