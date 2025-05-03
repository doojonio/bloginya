import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

export interface ListCollectionsResponseItem {
  id: string;
  title: string;
  description?: string | null;
  img_src?: string | null;
  created_at?: string;
}

export interface ListCollectionsResponse {
  parent_title?: string;
  parent_img_src?: string;
  grandparent_id?: string | null;
  collections: ListCollectionsResponseItem[];
}

export interface GetCollectionResponseBlogItem {
  id: string;
  title: string;
  img_src: string | null;
}

export interface GetCollectionResponseCollectionItem {
  id: string;
  title: string;
  img_src: string | null;
}
export interface GetCollectionResponse {
  title: string;
  img_src: string;
  blogs: GetCollectionResponseBlogItem[];
  collections: GetCollectionResponseCollectionItem[];
}

export interface CreateCollectionRequest {
  title: string | null;
  parent_id?: string;
  description?: string;
  img_src?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  constructor(private http: HttpClient) {}

  createCollection(col: CreateCollectionRequest) {
    return this.http
      .post<{ id: string }>('/api/collections', col)
      .pipe(map(({ id }) => id));
  }

  listCollections(parentId?: string) {
    let params = new HttpParams();
    if (parentId) {
      params = params.set('pid', parentId);
    }
    return this.http.get<ListCollectionsResponse>('/api/collections/list', {
      params,
    });
  }

  getCollection(id: string) {
    return this.http.get<GetCollectionResponse>('/api/collections', {
      params: { id },
    });
  }
}
