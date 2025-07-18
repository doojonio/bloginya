import { Component, inject, input, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatDrawer, MatSidenavContent } from '@angular/material/sidenav';
import { Footer } from '../../../footer';
import { AppService } from '../../../shared/services/app.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  standalone: false,
})
export class NavigationComponent implements OnInit {
  ngOnInit(): void {}

  appService = inject(AppService);
  isHandset = toSignal(this.appService.isHandset());

  footer = input.required<Footer>();

  drawerOpened = false;

  Footer = Footer;

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
