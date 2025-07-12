import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AnyViewComponent } from './view/any-view/any-view.component';
import { CategoryComponent } from './view/category/category.component';
import { DraftsComponent } from './view/drafts/drafts.component';

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
  {
    path: 'p/:postId',
    loadComponent: () =>
      import('./view/post-view/post-view.component').then(
        (c) => c.PostViewComponent
      ),
  },
  { path: 'c/:catId', component: CategoryComponent },
  {
    path: 'me',
    loadComponent: () =>
      import('./about/about.component').then((c) => c.AboutComponent),
    title: 'POLYINE | About',
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./page-not-found/page-not-found.component').then(
        (c) => c.PageNotFoundComponent
      ),
    title: 'POLYINE | Not Found',
  },
  { path: ':shortname', component: AnyViewComponent },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
