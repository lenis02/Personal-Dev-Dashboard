import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  // 테스트용 데이터 (나중에 UserService랑 연결)
  user = signal({ squat: 180, bench: 120, deadlift: 200 });

  // 3대 중량 계산
  totalSBD = computed(
    () => this.user().squat + this.user().bench + this.user().deadlift
  );

  // 티어 계산
  userTier = computed(() => {
    const total = this.totalSBD();
    if (total >= 600) return '기구 파괴자';
    if (total >= 500) return '헬스장 고인물';
    if (total >= 400) return '패션근육';
    if (total >= 300) return '헬중딩';
    return '헬린이';
  });

  // 승급까지 남은 중량 계산
  remainingSbd = computed(() => {
    const total = this.totalSBD();
    if (total < 300) return 300 - total;
    if (total < 400) return 400 - total;
    if (total < 500) return 500 - total;
    if (total < 600) return 600 - total;
    return 0;
  });

  // 다음 승급까지 진행도 계산
  progressPercentage = computed(() => {
    const total = this.totalSBD();
    
    // 시작점, 목표점
    let currentBase = 0;
    let nextTarget = 300;

    if (total >= 600) return 100; // 최고 등급은 게이지 꽉 참
    else if (total >= 500) { currentBase = 500; nextTarget = 600; }
    else if (total >= 400) { currentBase = 400; nextTarget = 500; }
    else if (total >= 300) { currentBase = 300; nextTarget = 400; }

    // (현재 내 점수 - 현재 티어 바닥점수) / (목표 점수 - 바닥 점수) * 100
    const percentage = ((total - currentBase) / (nextTarget - currentBase)) * 100;
    return Math.round(percentage); // 깔끔하게 반올림
  });
}
