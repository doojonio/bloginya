import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { BlogsService, GetBlogResponse } from '../blogs.service';
import { AsyncPipe } from '@angular/common';
import { toHTML } from 'ngx-editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-view',
  imports: [AsyncPipe],
  templateUrl: './blog-view.component.html',
  styleUrl: './blog-view.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class BlogViewComponent {
  blog$: Observable<GetBlogResponse> | undefined;
  blogs = inject(BlogsService);
  sanitizer = inject(DomSanitizer);

  @Input()
  set id(blogId: string) {
    this.blog$ = this.blogs.getBlog(blogId).pipe(shareReplay(1));
  }

  toHTML(doc: any): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(toHTML(doc));
  }
}
