import { PostMed } from '../shared/components/post-med/post-med.component';

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
export interface Category {
  id: string;
  title: string;
  name: string | null;
  sort: SortBy;
  posts_num: number;
  page: number;
  grid_posts: CategoryPost[];
  list_posts: PostMed[];
}
export interface CategoryPost {
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
