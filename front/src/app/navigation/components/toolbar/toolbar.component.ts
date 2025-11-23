import { Component, inject, input, signal } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { AppService } from '../../../shared/services/app.service';
import { SearchService } from '../../../shared/services/search.service';

@Component({
  selector: 'app-toolbar',
  standalone: false,
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  private readonly searchService = inject(SearchService);

  searchInitInput = signal<string>('');

  onSearchAskSub = this.searchService.getSearchAsks().subscribe((query) => {
    this.searchInitInput.set(query);
    this.isSearch.set(true);
  });

  closeSearch() {
    this.isSearch.set(false);
  }
  isSearch = signal(false);
  drawer = input.required<MatDrawer>();
  appService = inject(AppService);
  appName$ = this.appService.getAppName();
  isHandset$ = this.appService.isHandset();

  isShowTitle$ = this.appService.isShowingToolbarTitle();

  startSearch() {
    this.isSearch.set(true);
  }
}
