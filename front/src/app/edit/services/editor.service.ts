import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { NotifierService } from '../../shared/services/notifier.service';
import {
  ApplyChangesPayload,
  GetForEditResponse,
  UpdateDraftPayload,
} from '../edit.interface';
import { API_CONFIG } from '../../app.config';

@Injectable()
export class EditorService {
  private readonly http = inject(HttpClient);
  private readonly notifierS = inject(NotifierService);
  private readonly api = inject(API_CONFIG);

  getForEdit(postId: string) {
    return this.http
      .get<GetForEditResponse>(this.api.backendUrl + '/api/posts/for_edit', {
        params: { id: postId },
      })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() => this.notifierS.mapError(err))
        )
      );
  }

  getPostImages(postId: string) {
    return this.http
      .get<string[]>(this.api.backendUrl + `/api/posts/images`, { params: { post_id: postId } })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() => this.notifierS.mapError(err))
        )
      );
  }

  updateDraft(postId: string, fields: UpdateDraftPayload, notifyError = true) {
    return this.http
      .put(this.api.backendUrl + '/api/posts/draft', fields, {
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
      .put<{ message: string }>(this.api.backendUrl + '/api/posts', meta, { params: { id } })
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
