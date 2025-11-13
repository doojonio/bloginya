import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  BehaviorSubject,
  combineLatest,
  map,
  of,
  ReplaySubject,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { CategoryEditorComponent } from '../../../category/components/category-editor/category-editor.component';
import {
  CategoryStatuses,
  PostStatuses,
} from '../../../shared/interfaces/entities.interface';
import { CategoryService } from '../../../shared/services/category.service';
import { ShortnamesService } from '../../../shared/services/shortnames.service';

@Component({
  selector: 'app-meta-editor',
  standalone: false,
  templateUrl: './meta-editor.component.html',
  styleUrl: './meta-editor.component.scss',
})
export class MetaEditorComponent {
  postId = input.required<string>();
  valueSubject$ = input.required<ReplaySubject<any>>();
  isApplyDisabled = input.required<boolean>();

  onApply = output<MetaValue>();

  private shortnamesS = inject(ShortnamesService);
  private readonly categoriesS = inject(CategoryService);

  updateCategories$ = new BehaviorSubject(1);
  categories$ = this.updateCategories$.pipe(
    switchMap((_) => this.categoriesS.getCategories())
  );

  STATUSES = [
    { name: $localize`Public`, value: PostStatuses.Pub },
    { name: $localize`Private`, value: PostStatuses.Private },
    { name: $localize`Draft`, value: PostStatuses.Draft },
    { name: $localize`Del`, value: PostStatuses.Del },
  ];

  tags = signal<string[]>([]);

  public meta = new FormGroup({
    tags: new FormControl<string[]>([], {
      nonNullable: true,
      validators: [],
    }),
    status: new FormControl(PostStatuses.Draft, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    category_id: new FormControl<string | null>(null),
    shortname: new FormControl<null | string>(
      null,
      [
        Validators.minLength(3),
        Validators.maxLength(16),
        Validators.pattern(/^\w+$/),
      ],
      this.validateUniqueShortname.bind(this)
    ),
    enable_likes: new FormControl(true, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    enable_comments: new FormControl(true, {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });
  tagsControl = computed(() => this.meta.get('tags')! as FormControl);

  public setValue(value: MetaValue) {
    this.tags.set(value.tags);
    this.meta.setValue({
      tags: value.tags,
      status: value.status,
      category_id: value.category_id || null,
      shortname: value.shortname,
      enable_likes: value.enable_likes,
      enable_comments: value.enable_comments,
    });
  }

  validateUniqueShortname(control: AbstractControl) {
    const { value } = control;
    if (value == null || value.length < 3) {
      return of(null);
    }
    return this.shortnamesS
      .getShortname(value)
      .pipe(
        map((sn) =>
          sn && sn.post_id !== this.postId() ? { taken: true } : null
        )
      );
  }

  readonly dialog = inject(MatDialog);

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.valueSubject$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.setValue.bind(this));

    combineLatest([this.categories$, this.meta.valueChanges])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([categories, meta]) => {
        const status = meta.status;

        const categoryIdControl = this.meta.get('category_id')!;
        if (status == PostStatuses.Pub) {
          categoryIdControl.setValidators([Validators.required]);
        } else {
          categoryIdControl.clearValidators();
        }

        categoryIdControl.updateValueAndValidity({ emitEvent: false });

        if (!categories.length) return;

        const selectedCategoryId = meta.category_id;
        const selectedCategory = categories.find(
          (c) => c.id === selectedCategoryId
        );
        const statusControl = this.meta.get('status')!;
        if (selectedCategory?.status == CategoryStatuses.Private) {
          if (statusControl.value !== PostStatuses.Private) {
            statusControl.setValue(PostStatuses.Private, { emitEvent: false });
          }
          if (statusControl.enabled) {
          }
          statusControl.disable({ emitEvent: false });
        } else {
          if (statusControl.value === PostStatuses.Private) {
            statusControl.setValue(PostStatuses.Draft, { emitEvent: false });
          }

          if (statusControl.disabled) {
            statusControl.enable({ emitEvent: false });
          }
        }

        statusControl.updateValueAndValidity({ emitEvent: false });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addNewCategory() {
    const dialogRef = this.dialog.open(CategoryEditorComponent, {
      restoreFocus: false,
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp) {
        return;
      }
      this.updateCategories$.next(1);
    });
  }

  applyChanges() {
    if (this.meta.invalid) {
      console.error("meta invalid ");
      return;
    }

    this.onApply.emit(this.meta.getRawValue());
  }
}

export interface MetaValue {
  tags: string[];
  status: PostStatuses;
  category_id: string | null;
  shortname: string | null;
  enable_likes: boolean;
  enable_comments: boolean;
}
