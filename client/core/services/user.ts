import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // 현재 사용자 상태 관리
  private userSignal = signal<User | null>(null);
  user = this.userSignal.asReadonly();

  constructor(private http: HttpClient) {}

  // 유저 정보 가져오기 API 호출
  fetchUser(id: number) {
    this.http.get<User>(`/api/users/${id}`).subscribe((data) => {
      this.userSignal.set(data);
    });
  }
}
