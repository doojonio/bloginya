import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PostEditorComponent } from './post-editor/post-editor.component';
import { AnyViewComponent } from './view/any-view/any-view.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'edit/:postId', component: PostEditorComponent },
  { path: ':shortname', component: AnyViewComponent },
];
