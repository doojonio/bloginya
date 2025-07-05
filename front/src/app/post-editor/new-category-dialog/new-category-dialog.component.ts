import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { catchError, map, of, Subject, takeUntil } from 'rxjs';
import { CategoryService } from '../../category.service';
import { ShortnamesService } from '../../shortnames.service';

@Component({
  selector: 'app-new-category-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './new-category-dialog.component.html',
  styleUrl: './new-category-dialog.component.scss',
})
export class NewCategoryDialogComponent implements OnDestroy {
  readonly dialogRef = inject(MatDialogRef<NewCategoryDialogComponent>);
  // readonly data = inject<AddCategoryResponse>(MAT_DIALOG_DATA);

  private readonly categoryService = inject(CategoryService);
  private readonly shortnamesService = inject(ShortnamesService);

  separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
  tags = signal<string[]>([]);
  removeTag(tag: string) {
    this.tags.update((tags) => {
      const idx = tags.indexOf(tag);
      if (idx < 0) {
        return tags;
      }

      tags.splice(idx, 1);
      return [...tags];
    });
  }
  addTag(event: MatChipInputEvent) {
    const tag = (event.value || '').trim();
    if (tag.length < 3) {
      return;
    }

    this.tags.update((tags) => {
      if (tags.indexOf(tag) >= 0) {
        return tags;
      }
      return [...tags, tag];
    });
    event.chipInput.clear();
  }

  form = new FormGroup({
    title: new FormControl(
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(120),
        Validators.pattern(/^[\w \-]+$/),
      ],
      this.validateUniqueTitle.bind(this)
    ),
    description: new FormControl(''),
    tags: new FormControl<string[]>([]),
    shortname: new FormControl<null | string>(
      null,
      [
        Validators.minLength(3),
        Validators.maxLength(16),
        Validators.pattern(/^\w+$/),
      ],
      this.validateUniqueShortname.bind(this)
    ),
  });
  validateUniqueShortname(control: AbstractControl) {
    const { value } = control;
    if (value == null || value.length < 3) {
      return of(null);
    }
    return this.shortnamesService
      .getShortname(value)
      .pipe(map((sn) => (sn ? { taken: true } : null)));
  }

  private destroy$ = new Subject<void>();

  addCategory() {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.value;
    this.categoryService
      .addCategory({
        title: value.title || '',
        description: value.description || null,
        tags: value.tags || [],
        shortname: value.shortname || null,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp) => {
        this.dialogRef.close(resp);
      });
  }

  validateUniqueTitle(control: AbstractControl) {
    const { value } = control;
    if (value == null || value.length < 3) {
      return of(null);
    }
    return this.categoryService.getCategoryByTitle(value).pipe(
      catchError((_) => of(null)),
      map((cat) => (cat ? { taken: true } : null))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
