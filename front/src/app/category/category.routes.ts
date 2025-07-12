import { Routes } from '@angular/router';
import { CategoryComponent } from './category/category.component';

export const routes: Routes = [
  {
    path: ':catId',
    component: CategoryComponent,
  },
];
