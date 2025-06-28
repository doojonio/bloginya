import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Category } from './view/category/category.component';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private readonly http: HttpClient) {}
  loadCategory(id: string) {
    return this.http.get<Category>('/api/categories/load', { params: { id } });
  }
}
