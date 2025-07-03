import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { PostServiceErrors } from './posts.service';
import { Category, SortBy } from './view/category/category.component';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly snackBar = inject(MatSnackBar);

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
            notifyError ? this.notifyError(err) : this.mapError(err)
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
            notifyError ? this.notifyError(err) : this.mapError(err)
          )
        )
      );
  }
  getCategoryByTitle(title: string) {
    return this.http.get<Category>('/api/categories/by_title', {
      params: { title },
    });
  }

  private notifyError(httpErr: HttpErrorResponse) {
    const err = this.mapError(httpErr);
    // TODO: global config or service?
    const config = { duration: 5000 };
    if (err == PostServiceErrors.UNDEF) {
      this.snackBar.open('Unknown error', 'Close', config);
    } else if (err == PostServiceErrors.NORIGHT) {
      this.snackBar.open('Forbidden', 'Close', config);
    } else if (err == PostServiceErrors.NOCAT) {
      this.snackBar.open('Missing category', 'Close', config);
    }

    return err;
  }
  private mapError(error: HttpErrorResponse) {
    const message = error.error?.message;
    if (message == 'NOCAT') {
      return PostServiceErrors.NOCAT;
    } else if (message == 'NORIGHT') {
      return PostServiceErrors.NORIGHT;
    }
    return PostServiceErrors.UNDEF;
  }
}
export interface CategoryPayload {
  title: string;
  description: string | null;
  parent_id?: string | null;
  priority?: number | null;
  shortname: string | null;
  tags: string[];
}
export interface AddCategoryResponse {
  id: string;
  title: string;
}

export interface CategoryForEditResponse {
  id: string;
  title: string;
  description: string;
  shortname: string | null;
  tags: string[];
}
