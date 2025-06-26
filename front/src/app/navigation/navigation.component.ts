import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatSidenavContent, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AppService } from '../app.service';
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
    AsyncPipe,
    RouterModule,
    ToolbarComponent,
    SidenavComponent,
    FooterComponent,
  ],
})
export class NavigationComponent implements OnInit {
  ngOnInit(): void {}

  appService = inject(AppService);
  isHandset$ = this.appService.isHandset();

  @ViewChild('content', { static: true }) content!: MatSidenavContent;

  scrollToTop() {
    this.content.scrollTo({ top: 0 });
  }
}
