import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<div style="padding: 2rem;">
    로그인 처리 중입니다... 잠시만 기다려주세요!
  </div>`,
})
export class AuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];

      if (token) {
        this.authService.setToken(token);
        window.location.href = '/';
        // this.router.navigate(['/']);
      } else {
        alert('로그인에 실패했습니다.');
        window.location.href = '/';
        // this.router.navigate(['/']);
      }
    });
  }
}
