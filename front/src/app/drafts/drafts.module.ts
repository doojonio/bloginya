import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PostListGridTitlesComponent } from '../shared/components/post-list-grid-titles/post-list-grid-titles.component';
import { DraftsRoutingModule } from './drafts-routing.module';
import { DraftsComponent } from './drafts/drafts.component';
import { DraftsService } from './services/drafts.service';

@NgModule({
  declarations: [DraftsComponent],
  providers: [DraftsService],
  imports: [
    CommonModule,
    AsyncPipe,
    PostListGridTitlesComponent,
    DraftsRoutingModule,
  ],
})
export class DraftsModule {}
