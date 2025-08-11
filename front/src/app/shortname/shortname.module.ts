import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoryModule } from '../category/category.module';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { PostModule } from '../post/post.module';
import { ShortnameRoutingModule } from './shortname-routing.module';
import { ShortnameComponent } from './shortname/shortname.component';

@NgModule({
  declarations: [ShortnameComponent],
  imports: [
    CommonModule,
    ShortnameRoutingModule,
    AsyncPipe,
    MatProgressSpinnerModule,
    PostModule,
    PageNotFoundComponent,
    CategoryModule,
  ],
})
export class ShortnameModule {}
