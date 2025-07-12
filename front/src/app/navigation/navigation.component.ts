import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  MatDrawer,
  MatSidenavContent,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AppService } from '../shared/services/app.service';
import { FooterComponent } from './footer/footer.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ToolbarComponent } from './toolbar/toolbar.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  imports: [
    MatToolbarModule,
    MatSidenavModule,
    RouterModule,
    ToolbarComponent,
    SidenavComponent,
    FooterComponent,
  ],
})
export class NavigationComponent implements OnInit {
  ngOnInit(): void {}

  appService = inject(AppService);
  isHandset = toSignal(this.appService.isHandset());

  drawerOpened = false;

  private scrollToTopSub = this.appService
    .getScrollToTop()
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.scrollToTop());

  @ViewChild('content', { static: true }) content!: MatSidenavContent;

  scrollToTop() {
    this.content.scrollTo({ top: 0 });
  }

  @ViewChild('drawer', { static: true }) drawer!: MatDrawer;

  closeDrawer() {
    this.drawer.close();
  }
}
