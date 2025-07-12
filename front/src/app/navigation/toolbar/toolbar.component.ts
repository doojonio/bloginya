import { AsyncPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { AppService } from '../../shared/services/app.service';
import { SearchComponent } from './search/search.component';

@Component({
  selector: 'app-toolbar',
  imports: [
    MatIconModule,
    AsyncPipe,
    MatButtonModule,
    RouterModule,
    SearchComponent,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
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
