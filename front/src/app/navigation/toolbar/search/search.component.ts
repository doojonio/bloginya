import { AsyncPipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, output, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteActivatedEvent,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { AppService } from '../../../app.service';
import { picStyle } from '../../../posts.service';
import { QueryResult, SearchService } from '../../../search.service';

@Component({
  selector: 'app-search',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly appService = inject(AppService);
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  readonly onCloseSearch = output();
  readonly isHandset$ = this.appService.isHandset();
  readonly searchControl = new FormControl<string>('');

  readonly results = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      filter(Boolean),
      filter((val) => val.length > 2),
      debounceTime(500),
      switchMap((value) =>
        this.searchService.search(value).pipe(catchError((_) => of([])))
      )
    )
  );

  itemBack(item: QueryResult) {
    return picStyle(item.picture_pre, 'thumbnail');
  }
  itemUrl(item: QueryResult) {
    if (item.name) {
      return ['/', item.name];
    } else if (item.type == 'post') {
      return ['/p', item.id];
    } else if (item.type == 'category') {
      return ['/c', item.id];
    }
    return [];
  }

  goToItem($event: MatAutocompleteActivatedEvent) {
    this.closeSearch();
    this.router.navigateByUrl($event.option!.id);
  }

  clearInput() {
    this.searchControl.setValue('');
  }
  closeSearch() {
    this.onCloseSearch.emit();
  }
}
