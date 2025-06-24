import { UpperCasePipe } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { Category, CatPost } from '../../posts.service';

@Component({
  selector: 'app-post-list-category',
  imports: [MatChipsModule, UpperCasePipe],
  templateUrl: './post-list-category.component.html',
  styleUrl: './post-list-category.component.scss',
})
export class PostListCategoryComponent {
  onChange(newLang: MatChipListboxChange) {
    this.selectedCat.update((old) => newLang.value);
  }

  title = input<string>();
  cats = input.required<Category[]>();
  selectedCat = model<Category>();
  posts = input.required<CatPost[]>();
}
