import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../enum';

export const roleGuard = (requiredRole: UserRole): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const user   = auth.currentUser;

  if (user?.role === requiredRole) return true;

  router.navigate(['/dashboard']);
  return false;
};
