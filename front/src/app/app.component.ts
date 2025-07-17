import { Component, inject, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Footer } from './footer';
import {
  NavigationComponent,
  NavigationModule,
} from './navigation/navigation.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, NavigationModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  constructor(matIconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    for (const icon of ['instagram', 'podcast', 'naver']) {
      matIconRegistry.addSvgIcon(
        icon,
        sanitizer.bypassSecurityTrustResourceUrl(`../assets/icons/${icon}.svg`)
      );
    }
  }

  footer = Footer.BLANK;

  @ViewChild('nav', { static: true }) nav!: NavigationComponent;
  onActivate($event: any) {
    this.nav.scrollToTop();
    this.nav!.closeDrawer();

    const footer = this.activatedRoute.firstChild?.snapshot.data['footer'];
    this.footer = footer === undefined ? Footer.BLANK : footer;
  }
}
