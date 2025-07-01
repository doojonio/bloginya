import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-footer',
  imports: [AsyncPipe, MatIcon, MatDividerModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private appService = inject(AppService);
  socials$ = this.appService.getSocials();
  appName$ = this.appService.getAppName();
}
