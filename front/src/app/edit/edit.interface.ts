import { PostStatuses } from '../shared/interfaces/post-statuses.interface';

export interface GetForEditResponse {
  user_id: string;
  category_id: string | null;
  title: string;
  document: any;
  picture_wp: string | null;
  picture_pre: string | null;
  status: PostStatuses;
  shortname: string | null;
  description: string;
  enable_likes: boolean;
  enable_comments: boolean;
  tags: string[];
}
export interface ApplyChangesPayload {
  tags: string[];
  status: PostStatuses;
  category_id: string | null;
  shortname: string | null;
  enable_likes: boolean;
  enable_comments: boolean;
}
export interface UpdateDraftPayload {
  title?: string;
  document?: any;
  picture_wp?: string | null;
  picture_pre?: string | null;
}

export interface ListCategoryItem {
  id: string;
  title: string;
}
