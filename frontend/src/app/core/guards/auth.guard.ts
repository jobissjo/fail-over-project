import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { TokenService } from '../auth/token.service';

export const authGuard: CanActivateFn = () => {
  const token = inject(TokenService).get();
  if (token) return true;

  inject(Router).navigateByUrl('/login');
  return false;
};
