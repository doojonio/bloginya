import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PostEditorComponent } from './post-editor/post-editor.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'new', component: PostEditorComponent },
  { path: 'edit/:postId', component: PostEditorComponent },
  { path: '**', component: PageNotFoundComponent },
];
