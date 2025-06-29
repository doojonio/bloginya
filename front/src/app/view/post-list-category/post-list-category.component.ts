import { UpperCasePipe } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { Category, CatPost } from '../../posts.service';
import { RouterModule } from '@angular/router';
import { PostListMedComponent } from "../post-list-med/post-list-med.component";

@Component({
  selector: 'app-post-list-category',
  imports: [MatChipsModule, UpperCasePipe, RouterModule, PostListMedComponent],
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
