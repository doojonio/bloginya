import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { CategoryModule } from '../category/category.module';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { PostModule } from '../post/post.module';
import { routes } from './shortname.routes';
import { ShortnameComponent } from './shortname/shortname.component';

@NgModule({
  declarations: [ShortnameComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    AsyncPipe,
    MatProgressSpinnerModule,
    PostModule,
    PageNotFoundComponent,
    CategoryModule,
  ],
})
export class ShortnameModule {}
