import { Component, effect, inject, input, model } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { combineLatest, filter, switchMap } from 'rxjs';
import { UserRoles } from '../../../shared/interfaces/user-roles.interface';
import {
  CategoryService,
  LoadCategoryResponse,
  SortBy,
} from '../../../shared/services/category.service';
import { SeoService } from '../../../shared/services/seo.service';
import { UserService } from '../../../shared/services/user.service';
import { CategoryEditorComponent } from '../category-editor/category-editor.component';

@Component({
  selector: 'app-category',
  standalone: false,
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent {
  page = input<number>(0);
  catId = input<string>();
  sort = input(SortBy.NEWEST);
  UserRoles = UserRoles;

  private readonly router = inject(Router);
  private readonly catService = inject(CategoryService);
  private readonly seoService = inject(SeoService);
  private readonly userService = inject(UserService);
  user$ = this.userService.getCurrentUser();

  SortBy = SortBy;

  catIdSub = combineLatest([
    toObservable(this.catId),
    toObservable(this.page),
    toObservable(this.sort),
  ])
    .pipe(
      filter(([id, page, sort]) =>
        this.cat() ? this.cat()?.page != page || this.cat()?.sort != sort : true
      ),
      switchMap(([id, page, sort]) =>
        this.catService.loadCategory(id || this.cat()!.id, page, sort)
      )
    )
    .subscribe((cat) => {
      this.cat.set(cat);
    });

  cat = model<LoadCategoryResponse>();

  private readonly dialog = inject(MatDialog);
  editCategory() {
    const id = this.cat()?.id;
    if (!id) {
      return;
    }

    const dialogRef = this.dialog.open(CategoryEditorComponent, {
      restoreFocus: false,
      data: { id },
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp) {
        return;
      }

      this.cat.update((cat) => {
        if (cat) {
          cat.title = resp.title;
        }
        return cat;
      });
      this.router.navigate(
        resp.shortname ? ['/', resp.shortname] : ['/', 'c', resp.id]
      );
    });
  }

  seoCatEffect = effect(() => {
    const cat = this.cat();
    if (cat) {
      this.seoService.applyForCategory(cat);
    }
  });

  onPageChange(page: number) {
    this.router.navigate([], {
      queryParams: { page: page || undefined },
    });
  }

  changeSort(sort: SortBy) {
    this.router.navigate([], {
      queryParams: { sort },
      queryParamsHandling: 'merge',
    });
  }
}
