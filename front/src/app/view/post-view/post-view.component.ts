import { DatePipe, DecimalPipe, I18nPluralPipe } from '@angular/common';
import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { PostsService, ReadPostResponse } from '../../posts.service';
import { DocumentDomComponent } from './document-dom/document-dom.component';

@Component({
  selector: 'app-post-view',
  imports: [
    DecimalPipe,
    I18nPluralPipe,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    DocumentDomComponent,
    MatDividerModule,
  ],
  templateUrl: './post-view.component.html',
  styleUrl: './post-view.component.scss',
})
export class PostViewComponent {
  postsService = inject(PostsService);
  post = model.required<ReadPostResponse>();
  title_image_style = computed(() => {
    const url = this.post().picture_wp;
    return url
      ? {
          background: [
            'linear-gradient(to right, rgba(0,0,0, 0.4))',
            `url(${url}) no-repeat center / cover`,
          ].join(', '),
        }
      : {};
  });

  tagClicked(tag: string) {
    throw new Error('Method not implemented.');
  }
  like() {
    this.postsService.like(this.post().id).subscribe((r) => {
      this.post.update((p) => {
        if (!p.liked) {
          p.liked = true;
          p.likes += 1;
        }

        return p;
      });
    });
  }
  unlike() {
    this.postsService.unlike(this.post().id).subscribe((r) => {
      this.post.update((p) => {
        if (p.liked) {
          p.liked = false;
          p.likes -= 1;
        }

        return p;
      });
    });
  }
}
