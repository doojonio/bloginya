import { Component, inject, input } from '@angular/core';
import { AppService } from '../../../shared/services/app.service';
import { TaggedCategoriesService } from '../../../shared/services/tagged-categories.service';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  mode = input<'light' | 'dark'>('light');

  taggedCatS = inject(TaggedCategoriesService);

  private appService = inject(AppService);
  socials$ = this.appService.getSocials();
  appName$ = this.appService.getAppName();
  categories$ = this.taggedCatS.getBlogCategories();

  currentYear = new Date().getFullYear();
  isHandset$ = this.appService.isHandset();
}
