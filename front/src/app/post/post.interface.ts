import { PostStatuses } from '../shared/interfaces/entities.interface';

export interface ReadPostResponse {
  id: string;
  name: string | null;
  title: string;
  document: any;
  status: PostStatuses;
  description: string;
  enable_likes: boolean;
  enable_comments: boolean;
  date: string;
  pics: number;
  ttr: number;
  category_name: string | null;
  category_id: string | null;
  category_title: string | null;
  picture_wp: string | null;
  picture_pre: string | null;
  audio_ids: string[];
  tags: string[];
  comments?: number;
  liked?: boolean;
  likes?: number;
  views?: number;
}
