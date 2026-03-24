import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
})
export class App {
  public authService = inject(AuthService);

  isAuthCallbackRoute(): boolean {
    return window.location.pathname === '/login/success';
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  loginWithKakao() {
    this.authService.loginWithKakao();
  }

  logout() {
    this.authService.logout();
    window.location.href = '/';
  }
}
