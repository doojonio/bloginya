import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { PostMed } from '../components/post-med/post-med.component';
import { CategoryStatuses } from '../interfaces/entities.interface';
import { NotifierService } from './notifier.service';
import { API_CONFIG } from '../../app.tokens';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly notifierS = inject(NotifierService);
  // router
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  constructor() {}

  getCategories() {
    return this.http.get<GetCategoriesItem[]>(this.api.backendUrl + '/api/categories/list');
  }

  loadCategory(id: string, page?: number, sortBy?: SortBy) {
    return this.http
      .get<LoadCategoryResponse>(this.api.backendUrl + '/api/categories/load', {
        params: { id, page: page || 0, sort: sortBy || SortBy.NEWEST },
      })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status == 404) {
            this.router.navigate(['/', 'not-found']);
          }
          throw err;
        })
      );
  }

  getForEdit(id: string) {
    return this.http.get<GetForEditResponse>(this.api.backendUrl + '/api/categories/for_edit', {
      params: { id },
    });
  }

  updateCategory(id: string, cat: UpdateCategoryPayload, notifyError = true) {
    return this.http
      .put<AddCategoryResponse>(this.api.backendUrl + '/api/categories', cat, { params: { id } })
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
      .post<AddCategoryResponse>(this.api.backendUrl + '/api/categories', cat)
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
      this.api.backendUrl + '/api/categories/by_title',
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
  status: CategoryStatuses;
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
  status: CategoryStatuses;
  description: string;
  shortname: string | null;
  tags: string[];
}
export interface LoadCategoryResponse {
  id:string;
  title: string;
  name: string | null;
  sort: SortBy;
  status: CategoryStatuses;
  posts_num: number;
  page: number;
  grid_posts: PostCategoryGrid[];
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

export interface GetCategoriesItem {
  id: string;
  title: string;
  status: CategoryStatuses;
  name: string | null;
  tags: string[];
}
