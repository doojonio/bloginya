import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { throwError } from 'rxjs';
import { OkResponse } from '../../shared/interfaces/responses.interface';
import { UserService } from '../../shared/services/user.service';

@Injectable()
export class LikerService {
  private userS = inject(UserService);
  private readonly http = inject(HttpClient);

  currentUser = toSignal(this.userS.getCurrentUser());

  unlike(id: string) {
    return this.http.delete<OkResponse>('/api/posts/like', { params: { id } });
  }
  like(id: string) {
    if (!this.currentUser()) {
      this.userS.goToLogin();
      return throwError(() => {});
    }

    return this.http.post<OkResponse>('/api/posts/like', null, {
      params: { id },
    });
  }
}
