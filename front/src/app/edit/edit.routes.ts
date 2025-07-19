import { Routes } from '@angular/router';
import { PostEditorComponent } from './components/post-editor/post-editor.component';

export const routes: Routes = [
  {
    path: ':postId',
    component: PostEditorComponent,
  },
];
