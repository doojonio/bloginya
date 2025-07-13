export interface GetDraftsResponse {
  drafts: GetDraftsItem[];
  continue_edit: GetDraftsItem[];
}
export interface GetDraftsItem {
  id: string;
  name: null;
  picture_pre: string | null;
  title: string;
  created_date: string;
  draft_id: string | null;
}
