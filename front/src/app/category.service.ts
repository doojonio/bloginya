import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category, SortBy } from './view/category/category.component';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private readonly http: HttpClient) {}
  loadCategory(id: string, page?: number, sortBy?: SortBy) {
    return this.http.get<Category>('/api/categories/load', {
      params: { id, page: page || 0, sort: sortBy || SortBy.OLDEST },
    });
  }
}
