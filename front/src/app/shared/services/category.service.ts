import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotifierService } from './notifier.service';
import {
  AddCategoryResponse,
  CategoryForEditResponse,
  CategoryLoaded,
  CategoryPayload,
  SortBy,
} from '../../category/category.interface';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly notifierS = inject(NotifierService);

  constructor(private readonly http: HttpClient) {}

  loadCategory(id: string, page?: number, sortBy?: SortBy) {
    return this.http.get<CategoryLoaded>('/api/categories/load', {
      params: { id, page: page || 0, sort: sortBy || SortBy.NEWEST },
    });
  }

  getForEdit(id: string) {
    return this.http.get<CategoryForEditResponse>('/api/categories/for_edit', {
      params: { id },
    });
  }

  updateCategory(id: string, cat: CategoryPayload, notifyError = true) {
    return this.http
      .put<AddCategoryResponse>('/api/categories', cat, { params: { id } })
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

  addCategory(cat: CategoryPayload, notifyError = true) {
    return this.http
      .post<AddCategoryResponse>('/api/categories', cat)
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
  getCategoryByTitle(title: string) {
    return this.http.get<CategoryLoaded>('/api/categories/by_title', {
      params: { title },
    });
  }
}
