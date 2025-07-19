import { Component, inject, input } from '@angular/core';
import { AppService } from '../../../shared/services/app.service';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  mode = input<'light' | 'dark'>('light');

  private appService = inject(AppService);
  socials$ = this.appService.getSocials();
  appName$ = this.appService.getAppName();

  currentYear = new Date().getFullYear();
  isHandset$ = this.appService.isHandset();
}
