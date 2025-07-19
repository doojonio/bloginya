import { Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatAutocompleteActivatedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { AppService } from '../../../shared/services/app.service';
import { PictureService } from '../../../shared/services/picture.service';
import { QueryResult, SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search',
  standalone: false,
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
      debounceTime(100),
      switchMap((value) =>
        this.searchService.search(value).pipe(catchError((_) => of([])))
      )
    )
  );

  private readonly picS = inject(PictureService);
  itemBack(item: QueryResult) {
    return this.picS.picStyle(item.picture_pre, 'thumbnail');
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
