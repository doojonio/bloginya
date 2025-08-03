import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root',
})
export class TaggedCategoriesService {
  private appS = inject(AppService);

  getBlogCategories() {
    return this.appS.getSettings().pipe(map((settings) => settings.categories));
  }
}
