import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

export interface GetBlogResponse {
  id: string;
  document: any;
}

export interface ListBlogsResponse {
  id: string;
  title: string;
  img_src: string;
}
export interface SaveBlogResponse {
  id: string;
}
@Injectable({
  providedIn: 'root',
})
export class BlogsService {
  constructor(private http: HttpClient) {}

  publishBlog(id: string, collectionId?: string) {
    return this.http.post('/api/blogs/publish', {
      blog_id: id,
      collection_id: collectionId,
    });
  }

  saveBlog(doc: any, id?: string) {
    return this.http
      .post<SaveBlogResponse>('/api/blogs', { doc, id })
      .pipe(map((r) => r.id));
  }

  getBlog(id: string) {
    return this.http.get<GetBlogResponse>('/api/blogs', { params: { id } });
  }

  listBlogs(limit: Number = 50, page: Number = 0, drafts: boolean = true) {
    return this.http.get<ListBlogsResponse[]>('/api/blogs/list', {
      params: { limit: String(limit), page: String(page), drafts },
    });
  }
}
