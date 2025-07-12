import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostListGridTitlesComponent } from '../view/post-list-grid-titles/post-list-grid-titles.component';
import { routes } from './drafts.routes';
import { DraftsComponent } from './drafts/drafts.component';

@NgModule({
  declarations: [DraftsComponent],
  imports: [
    CommonModule,
    AsyncPipe,
    PostListGridTitlesComponent,
    RouterModule.forChild(routes),
  ],
})
export class DraftsModule {}
