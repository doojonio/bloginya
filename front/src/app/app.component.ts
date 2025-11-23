import {
  afterNextRender,
  Component,
  inject,
  Injector,
  ViewChild,
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { MatIconRegistry } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AudioModule } from './audio/audio.module';
import { AudioPlayerComponent } from './audio/components/audio-player/audio-player.component';
import { Footer } from './footer';
import {
  NavigationComponent,
  NavigationModule,
} from './navigation/navigation.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, NavigationModule, AudioModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  constructor(
    matIconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    injector: Injector
  ) {
    // do not rely on customElements in SSR
    afterNextRender(() => {
      const AudioPlayerElement = createCustomElement(AudioPlayerComponent, {
        injector,
      });
      customElements.define('ce-audio-player', AudioPlayerElement);
    });

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
