import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token && authService.isTokenExpired(token)) {
    authService.logout();
    window.location.href = '/';
    return next(req);
  }

  // 토큰이 localStorage에 있다면
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq).pipe(
      catchError((error) => {
        if (error?.status === 401) {
          authService.logout();
          window.location.href = '/';
        }
        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError((error) => {
      if (error?.status === 401) {
        authService.logout();
        window.location.href = '/';
      }
      return throwError(() => error);
    })
  );
};
