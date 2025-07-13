import { Component, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
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
  constructor(matIconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    for (const icon of ['facebook', 'instagram', 'twitter', 'tiktok']) {
      matIconRegistry.addSvgIcon(
        icon,
        sanitizer.bypassSecurityTrustResourceUrl(`../assets/icons/${icon}.svg`)
      );
    }
  }

  @ViewChild('nav', { static: true }) el!: NavigationComponent;
  onActivate($event: any) {
    this.el.scrollToTop();
    this.el!.closeDrawer();
  }
}
