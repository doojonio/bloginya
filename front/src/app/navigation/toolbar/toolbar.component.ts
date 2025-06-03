import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer } from '@angular/material/sidenav';
import { AppService } from '../../app.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  imports: [MatIconModule, AsyncPipe, MatButtonModule, RouterModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  drawer = input.required<MatDrawer>();
  appService = inject(AppService);
  appName$ = this.appService.getAppName();
  isHandset$ = this.appService.isHandset();
}
