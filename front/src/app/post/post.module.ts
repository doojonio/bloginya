import {
  AsyncPipe,
  CommonModule,
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
} from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CommentsModule } from '../comments/comments.module';
import { PostListMedComponent } from '../shared/components/post-list-med/post-list-med.component';
import { VisibilityDirective } from '../shared/directives/visibility.directive';
import { DocumentDomComponent } from './document-dom/document-dom.component';
import { PostRoutingModule } from './post-routing.module';
import { PostViewComponent } from './post-view/post-view.component';
import { LikerService } from './services/liker.service';
import { ReaderService } from './services/reader.service';
import { StatService } from './services/stat.service';

@NgModule({
  declarations: [PostViewComponent, DocumentDomComponent],
  exports: [PostViewComponent],
  imports: [
    PostRoutingModule,
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
    VisibilityDirective,
    MatTooltipModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  providers: [ReaderService, LikerService, StatService],
})
export class PostModule {}
