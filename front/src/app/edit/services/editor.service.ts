import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { NotifierService } from '../../shared/services/notifier.service';
import {
  ApplyChangesPayload,
  GetForEditResponse,
  GetCategoriesItem,
  UpdateDraftPayload,
} from '../edit.interface';

@Injectable()
export class EditorService {
  private readonly http = inject(HttpClient);
  private readonly notifierS = inject(NotifierService);

  getCategories() {
    return this.http.get<GetCategoriesItem[]>('/api/categories/list');
  }

  getForEdit(postId: string) {
    return this.http.get<GetForEditResponse>('/api/posts/for_edit', {
      params: { id: postId },
    }).pipe(catchError((err: HttpErrorResponse) => throwError(() => this.notifierS.mapError(err))));
  }

  updateDraft(postId: string, fields: UpdateDraftPayload, notifyError = true) {
    return this.http
      .put('/api/posts/draft', fields, {
        params: { id: postId },
      })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() =>
            notifyError
              ? this.notifierS.notifyError(err)
              : this.notifierS.mapError(err)
          )
        )
      );
  }

  applyChanges(id: string, meta: ApplyChangesPayload, notifyError = true) {
    return this.http
      .put<{ message: string }>('/api/posts', meta, { params: { id } })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() =>
            notifyError
              ? this.notifierS.notifyError(err)
              : this.notifierS.mapError(err)
          )
        ),
        map((_) => 'OK')
      );
  }
}
