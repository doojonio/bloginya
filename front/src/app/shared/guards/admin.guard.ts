import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { UserService } from '../services/user.service';
import { UserRoles } from '../interfaces/user-roles.interface';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  return inject(UserService)
    .getCurrentUser()
    .pipe(
      map((user) => user && user.role == UserRoles.OWNER ? true : false),
      tap((ok) => (ok ? ok : router.navigate(['/not-found'])))
    );
};
