import { UpperCasePipe } from '@angular/common';
import { Component, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { AppService } from '../../app.service';
import { Category, CatPost, picStyle } from '../../posts.service';
import { PostListMedComponent } from '../post-list-med/post-list-med.component';

@Component({
  selector: 'app-post-list-category',
  imports: [
    MatChipsModule,
    UpperCasePipe,
    RouterModule,
    PostListMedComponent,
    MatTabsModule,
  ],
  templateUrl: './post-list-category.component.html',
  styleUrl: './post-list-category.component.scss',
})
export class PostListCategoryComponent {
  linkForPost(post: CatPost) {
    return post.name ? '/' + post.name : '/p/' + post.id;
  }
  imageUrl(post: CatPost) {
    return picStyle(post.picture_pre, 'medium');
  }
  onChangeTab($event: MatTabChangeEvent) {
    let cats = this.cats();
    this.selectedCat.set(cats[$event.index]);
  }
  private readonly appService = inject(AppService);
  isHandset = toSignal(this.appService.isHandset());

  onChange(newLang: MatChipListboxChange) {
    if (!newLang.value) {
      return;
    }
    this.selectedCat.update((old) => newLang.value);
  }

  title = input<string>();
  cats = input.required<Category[]>();
  selectedCat = model<Category>();
  posts = input.required<CatPost[]>();
}
