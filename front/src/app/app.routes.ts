import { Routes } from '@angular/router';
import { Footer } from './footer';
import { HomeComponent } from './home/home.component';
import { authorizedGuard } from './shared/guards/authorized.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'POLYINE',
    data: { footer: Footer.ANIM },
  },
  {
    path: 'drafts',
    canActivate: [authorizedGuard],
    loadChildren: () =>
      import('./drafts/drafts.module').then((m) => m.DraftsModule),
    title: 'POLYINE | Drafts',
  },
  {
    path: 'e',
    canActivate: [authorizedGuard],
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
    data: { footer: Footer.LINE },
    title: 'POLYINE | About',
  },
  {
    path: 'profile',
    canActivate: [authorizedGuard],
    loadComponent: () =>
      import('./profile-settings/profile-settings.component').then(
        (c) => c.ProfileSettingsComponent
      ),
    title: 'POLYINE | Profile Settings',
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
