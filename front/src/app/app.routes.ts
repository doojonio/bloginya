import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DraftsComponent } from './view/drafts/drafts.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'POLYINE' },
  { path: 'drafts', component: DraftsComponent, title: 'POLYINE | Drafts' },
  {
    path: 'e',
    loadChildren: () => import('./edit/edit.module').then((m) => m.EditModule),
    title: 'POLYINE | Editor',
  },
  {
    path: 'p',
    loadChildren: () => import('./post/post.module').then((c) => c.PostModule),
  },
  {
    path: 'c',
    loadChildren: () =>
      import('./category/category.module').then((c) => c.CategoryModule),
  },
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
  {
    path: ':shortname',
    loadChildren: () =>
      import('./shortname/shortname.module').then((m) => m.ShortnameModule),
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
