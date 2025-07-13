import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { UserService } from '../services/user.service';

export const authorizedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  return inject(UserService)
    .getCurrentUser()
    .pipe(
      map((user) => !!user),
      tap((ok) => (ok ? ok : (window.location.href = '/api/oauth/to_google')))
    );
};
