import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { PostMed } from '../components/post-med/post-med.component';
import { NotifierService } from './notifier.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly notifierS = inject(NotifierService);

  constructor(private readonly http: HttpClient) {}

  loadCategory(id: string, page?: number, sortBy?: SortBy) {
    return this.http.get<LoadCategoryResponse>('/api/categories/load', {
      params: { id, page: page || 0, sort: sortBy || SortBy.NEWEST },
    });
  }

  getForEdit(id: string) {
    return this.http.get<GetForEditResponse>('/api/categories/for_edit', {
      params: { id },
    });
  }

  updateCategory(id: string, cat: UpdateCategoryPayload, notifyError = true) {
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

  addCategory(cat: UpdateCategoryPayload, notifyError = true) {
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
    return this.http.get<GetCategoryByTitleResponse>(
      '/api/categories/by_title',
      {
        params: { title },
      }
    );
  }
}

export interface GetCategoryByTitleResponse {
  id: string;
  title: string;
  priority: number | null;
  description: string;
}

export interface UpdateCategoryPayload {
  title: string;
  description: string | null;
  parent_id?: string | null;
  priority?: number | null;
  shortname: string | null;
  tags: string[];
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
export interface GetForEditResponse {
  id: string;
  title: string;
  description: string;
  shortname: string | null;
  tags: string[];
}
export interface LoadCategoryResponse {
  id: string;
  title: string;
  name: string | null;
  sort: SortBy;
  posts_num: number;
  page: number;
  grid_posts: PostCategoryGrid[];
  list_posts: PostMed[];
}
export interface PostCategoryGrid {
  picture_pre: string;
  title: string;
  id: string;
  name: string;
}
export enum SortBy {
  OLDEST = 'published_at',
  NEWEST = '!published_at',
  POPULAR = '!popularity',
}
