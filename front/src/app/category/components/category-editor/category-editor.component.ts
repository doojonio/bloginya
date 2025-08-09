import {
  Component,
  Inject,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { catchError, map, of, Subject, takeUntil } from 'rxjs';
import { CategoryStatuses } from '../../../shared/interfaces/entities.interface';
import { CategoryService } from '../../../shared/services/category.service';
import { ShortnamesService } from '../../../shared/services/shortnames.service';

@Component({
  selector: 'app-category-editor',
  standalone: false,
  templateUrl: './category-editor.component.html',
  styleUrl: './category-editor.component.scss',
})
export class CategoryEditorComponent implements OnInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<CategoryEditorComponent>);
  constructor(@Inject(MAT_DIALOG_DATA) public data: { id?: string }) {}

  private readonly categoriesSerivce = inject(CategoryService);
  private readonly shortnamesService = inject(ShortnamesService);

  STATUSES = [
    { name: $localize`Public`, value: CategoryStatuses.Pub },
    { name: $localize`Private`, value: CategoryStatuses.Private },
  ];

  ngOnInit(): void {
    if (!this.data?.id) {
      return;
    }

    this.categoriesSerivce
      .getForEdit(this.data?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((cat) => {
        this.tags.set(cat.tags);
        this.form.setValue({
          title: cat.title,
          status: cat.status,
          description: cat.description,
          tags: cat.tags,
          shortname: cat.shortname,
        });
      });
  }

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
    status: new FormControl(CategoryStatuses.Pub, Validators.required),
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
      .pipe(
        map((sn) =>
          sn && sn.category_id != this.data.id ? { taken: true } : null
        )
      );
  }

  private destroy$ = new Subject<void>();

  apply() {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.value;

    if (this.data.id) {
      this.categoriesSerivce
        .updateCategory(this.data.id, {
          title: value.title || '',
          description: value.description || null,
          tags: value.tags || [],
          shortname: value.shortname || null,
          status: value.status || CategoryStatuses.Pub,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe((resp) => {
          this.dialogRef.close({ id: resp.id, ...value });
        });
    } else {
      this.categoriesSerivce
        .addCategory({
          title: value.title || '',
          description: value.description || null,
          tags: value.tags || [],
          shortname: value.shortname || null,
          status: value.status || CategoryStatuses.Pub,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe((resp) => {
          this.dialogRef.close({ id: resp.id, ...value });
        });
    }
  }

  validateUniqueTitle(control: AbstractControl) {
    const { value } = control;
    if (value == null || value.length < 3) {
      return of(null);
    }
    return this.categoriesSerivce.getCategoryByTitle(value).pipe(
      catchError((_) => of(null)),
      map((cat) => (cat && cat.id != this.data.id ? { taken: true } : null))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
