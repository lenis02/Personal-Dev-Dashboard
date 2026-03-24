import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';

  // 구글 로그인 페이지로 이동
  loginWithGoogle(): void {
    window.location.href = 'http://localhost:3000/api/auth/google'
  }
  
  // 카카오 로그인 페이지로 이동
  loginWithKakao(): void {
    window.location.href = 'http://localhost:3000/api/auth/kakao'
  }

  // 토큰 저장
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // 토큰 가져오기
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private parseJwtPayload(token: string): Record<string, any> | null {
    try {
      const base64 = token.split('.')[1];
      if (!base64) return null;
      const normalized = base64.replace(/-/g, '+').replace(/_/g, '/');
      const payload = decodeURIComponent(
        atob(normalized)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const payload = this.parseJwtPayload(token);
    if (!payload || typeof payload['exp'] !== 'number') {
      return true;
    }
    const nowSec = Math.floor(Date.now() / 1000);
    return payload['exp'] <= nowSec;
  }

  // 로그아웃 (토큰 삭제)
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // 로그인 상태 확인
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }
}