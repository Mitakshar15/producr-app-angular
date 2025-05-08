import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAuthToken();

  if (token) {
    // For FormData requests, only add Authorization header
    // Do NOT set Content-Type as the browser will set it with the boundary
    if (req.body instanceof FormData) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      // For regular requests, set both Authorization and Content-Type
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': req.headers.get('Content-Type') || 'application/json'
        }
      });
    }
  }

  return next(req);
};
