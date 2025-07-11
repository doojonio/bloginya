import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AnyViewComponent } from './view/any-view/any-view.component';
import { CategoryComponent } from './view/category/category.component';
import { DraftsComponent } from './view/drafts/drafts.component';
import { PostViewComponent } from './view/post-view/post-view.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'POLYINE' },
  { path: 'drafts', component: DraftsComponent, title: 'POLYINE | Drafts' },
  {
    path: 'e/:postId',
    loadComponent: () =>
      import('./post-editor/post-editor.component').then(
        (c) => c.PostEditorComponent
      ),
    title: 'POLYINE | Editor',
  },
  { path: 'p/:postId', component: PostViewComponent },
  { path: 'c/:catId', component: CategoryComponent },
  { path: 'me', component: AboutComponent },
  { path: 'not-found', component: PageNotFoundComponent },
  { path: ':shortname', component: AnyViewComponent },
  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'POLYINE | Not Found',
  },
];
