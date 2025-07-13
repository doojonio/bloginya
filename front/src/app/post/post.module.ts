import {
  AsyncPipe,
  CommonModule,
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
} from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { CommentsModule } from '../comments/comments.module';
import { PostListMedComponent } from '../shared/components/post-list-med/post-list-med.component';
import { VisibilityDirective } from '../shared/directives/visibility.directive';
import { DocumentDomComponent } from './document-dom/document-dom.component';
import { PostViewComponent } from './post-view/post-view.component';
import { routes } from './post.routes';
import { ReaderService } from './services/reader.service';
import { LikerService } from './services/liker.service';

@NgModule({
  declarations: [PostViewComponent, DocumentDomComponent],
  exports: [PostViewComponent],
  imports: [
    AsyncPipe,
    CommentsModule,
    CommonModule,
    DatePipe,
    DecimalPipe,
    I18nPluralPipe,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PostListMedComponent,
    RouterModule,
    RouterModule.forChild(routes),
    VisibilityDirective,
  ],
  providers: [ReaderService, LikerService],
})
export class PostModule {}
