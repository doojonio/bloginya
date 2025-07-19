import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostListGridTitlesComponent } from '../shared/components/post-list-grid-titles/post-list-grid-titles.component';
import { routes } from './drafts.routes';
import { DraftsComponent } from './drafts/drafts.component';
import { DraftsService } from './services/drafts.service';

@NgModule({
  declarations: [DraftsComponent],
  providers: [DraftsService],
  imports: [
    CommonModule,
    AsyncPipe,
    PostListGridTitlesComponent,
    RouterModule.forChild(routes),
  ],
})
export class DraftsModule {}
