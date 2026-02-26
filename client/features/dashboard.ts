import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  // 유저 데이터
  user = signal({ squat: 0, bench: 0, deadlift: 0});

  // SBD 자동 계산
  totalSBD = computed(() => this.user().squat + this.user().bench + this.user().deadlift);

  // 티어 판별 로직 (정책 기반)
  userTier = computed(() => {
    const total = this.totalSBD();
    if (total >= 600) return '기구 파괴자'
    if (total >= 500) return '헬스장 고인물'
    if (total >= 400) return '패션근육'
    if (total >= 300) return '헬중딩'
    return '헬린이';
  });

  // 다음 등급까지 남은 무게 계산
  remainingSBD = computed(()=> {
    const total = this.totalSBD();
    if (total < 300) return 300 - total;
    if (total < 400) return 400 - total;
    if (total < 500) return 500 - total;
    if (total < 600) return 600 - total;
    return 0;
  })
}
