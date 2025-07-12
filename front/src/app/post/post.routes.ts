import { Routes } from '@angular/router';
import { PostViewComponent } from './post-view/post-view.component';

export const routes: Routes = [
  {
    path: ':postId',
    component: PostViewComponent,
  },
];
