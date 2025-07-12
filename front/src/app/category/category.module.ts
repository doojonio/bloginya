import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { PostListGridTitlesComponent } from '../shared/components/post-list-grid-titles/post-list-grid-titles.component';
import { PostListMedComponent } from '../shared/components/post-list-med/post-list-med.component';
import { routes } from './category.routes';
import { CategoryComponent } from './category/category.component';

@NgModule({
  declarations: [CategoryComponent],
  exports: [CategoryComponent],
  imports: [
    CommonModule,
    PostListMedComponent,
    PostListGridTitlesComponent,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    AsyncPipe,
    RouterModule.forChild(routes),
  ],
})
export class CategoryModule {}
