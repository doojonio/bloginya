import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { Category, CatPost } from '../../../posts.service';

@Component({
  selector: 'app-lang-posts',
  imports: [AsyncPipe, MatChipsModule, UpperCasePipe],
  templateUrl: './lang-posts.component.html',
  styleUrl: './lang-posts.component.scss',
})
export class LangPostsComponent {
  onChange(newLang: MatChipListboxChange) {
    this.selectedLang.update((old) => newLang.value);
  }

  langs$ = input.required<Observable<Category[]>>();
  langPosts$ = input.required<Observable<CatPost[]>>();
  selectedLang = model<Category>();
}
