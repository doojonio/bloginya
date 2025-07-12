

export interface DraftsResponse {
  drafts: Draft[];
  continue_edit: Draft[];
}export interface Draft {
  id: string;
  name: null;
  picture_pre: string | null;
  title: string;
  created_date: string;
  draft_id: string | null;
}

