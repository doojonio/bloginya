export interface HomeResponse {
  new_posts: PostOnelined[];
  cats: Category[];
  top_cat: Category;
  top_cat_posts: PostDescribed[];
  popular_posts: PostPictured[];
}
export interface Category {
  id: string;
  title: string;
  name: string;
  // only in top cat
  posts?: PostDescribed[];
}
export interface PostDescribed {
  id: string;
  name: string | null;
  picture_pre: string;
  title: string;
  description: string;
  tags: string[];
}
export interface PostPictured {
  id: string;
  name: string | null;
  picture_pre: string;
}
export interface PostOnelined {
  id: string;
  name: string | null;
  picture_pre: string;
  category_title: string;
  category_name: string;
  category_id: string;
  created_at: Date;
  title: string;
  tags: string[];
}
