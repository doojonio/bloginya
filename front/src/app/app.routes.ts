import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PostEditorComponent } from './post-editor/post-editor.component';
import { AnyViewComponent } from './view/any-view/any-view.component';
import { CategoryComponent } from './view/category/category.component';
import { PostViewComponent } from './view/post-view/post-view.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Polyine' },
  {
    path: 'e/:postId',
    component: PostEditorComponent,
    title: 'Polyine | Editor',
  },
  { path: 'p/:postId', component: PostViewComponent },
  { path: 'c/:catId', component: CategoryComponent },
  { path: ':shortname', component: AnyViewComponent },
  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'Polyine | Not Found',
  },
];
