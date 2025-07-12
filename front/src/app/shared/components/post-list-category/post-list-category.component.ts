import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, input, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { Category, PostDescribed } from '../../../home/home.interface';
import { AppService } from '../../services/app.service';
import { picStyle } from '../../services/picture.service';
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
  linkForPost(post: PostDescribed) {
    return post.name ? '/' + post.name : '/p/' + post.id;
  }
  imageUrl(post: PostDescribed) {
    return picStyle(post.picture_pre, 'pre280');
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
  posts = input.required<PostDescribed[]>();

  first5 = computed(() => this.posts().slice(0, 5));
  first3 = computed(() => this.posts().slice(0, 3));
  second3 = computed(() => this.posts().slice(3, 6));
  third3 = computed(() => this.posts().slice(6, 9));
}
