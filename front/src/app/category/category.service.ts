import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { NotifierService } from '../shared/services/notifier.service';
import {
  AddCategoryResponse,
  Category,
  CategoryForEditResponse,
  CategoryPayload,
  SortBy,
} from './category.interface';

@Injectable()
export class CategoryService {
  private readonly notifierS = inject(NotifierService);

  constructor(private readonly http: HttpClient) {}

  loadCategory(id: string, page?: number, sortBy?: SortBy) {
    return this.http.get<Category>('/api/categories/load', {
      params: { id, page: page || 0, sort: sortBy || SortBy.NEWEST },
    });
  }
  getCategories() {
    return this.http.get<Category[]>('/api/categories/list');
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
    return this.http.get<Category>('/api/categories/by_title', {
      params: { title },
    });
  }
}
