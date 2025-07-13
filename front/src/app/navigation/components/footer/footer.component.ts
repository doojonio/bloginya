import { Component, inject } from '@angular/core';
import { AppService } from '../../../shared/services/app.service';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private appService = inject(AppService);
  socials$ = this.appService.getSocials();
  appName$ = this.appService.getAppName();
}
