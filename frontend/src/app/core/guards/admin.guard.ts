import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { decodeJwt } from '../auth/jwt';
import { TokenService } from '../auth/token.service';

export const adminGuard: CanActivateFn = () => {
  const token = inject(TokenService).get();
  if (!token) {
    inject(Router).navigateByUrl('/login');
    return false;
  }

  const payload = decodeJwt(token);
  if (payload?.role === 'admin') return true;

  inject(Router).navigateByUrl('/user/dashboard');
  return false;
};
