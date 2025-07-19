import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { NewCategoryDialogComponent } from '../edit/components/new-category-dialog/new-category-dialog.component';
import { PostListGridTitlesComponent } from '../shared/components/post-list-grid-titles/post-list-grid-titles.component';
import { PostListMedComponent } from '../shared/components/post-list-med/post-list-med.component';
import { routes } from './category.routes';
import { CategoryEditorComponent } from './components/category-editor/category-editor.component';
import { CategoryComponent } from './components/category/category.component';

@NgModule({
  declarations: [CategoryComponent, CategoryEditorComponent],
  exports: [CategoryComponent],
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatChipsModule,
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

export { NewCategoryDialogComponent };
