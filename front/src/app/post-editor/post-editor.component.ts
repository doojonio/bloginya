import {
  Component,
  computed,
  HostListener,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Editor,
  Validators as EditorValidators,
  NgxEditorModule,
} from 'ngx-editor';

import { AsyncPipe } from '@angular/common';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { BehaviorSubject, concat, of, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  map,
  share,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { AppService } from '../app.service';
import { DriveService } from '../drive.service';
import { PostsService, PostStatuses } from '../posts.service';
import { ShortnamesService } from '../shortnames.service';
import { UserService } from '../user.service';
import { NewCategoryDialogComponent } from './new-category-dialog/new-category-dialog.component';
import {
  findPlaceholder,
  placeholderPlugin,
} from './plugins/placeholder.plugin';

@Component({
  selector: 'app-post-editor',
  imports: [
    MatProgressSpinnerModule,
    NgxEditorModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    AsyncPipe,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.scss',
})
export class PostEditorComponent implements OnInit, OnDestroy {
  private appService = inject(AppService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private drive = inject(DriveService);
  private posts = inject(PostsService);
  private shortnamesService = inject(ShortnamesService);
  private router = inject(Router);

  readonly dialog = inject(MatDialog);

  isHandset$ = this.appService.isHandset();
  private destroy$ = new Subject<void>();
  currentUser$ = this.userService.getCurrentUser();
  statuses$ = this.appService.getPostStatuses();
  STATUSES = [
    { name: 'Public', value: PostStatuses.Pub },
    { name: 'Draft', value: PostStatuses.Draft },
    { name: 'Del', value: PostStatuses.Del },
  ];

  toolbar$ = this.appService.getEditorToolbar();
  colorPresets$ = this.appService.getEditorColorPallete();
  attachmentLoading = false;

  postId = input.required<string>();
  savedPost$ = computed(() =>
    this.posts.getForEdit(this.postId()).pipe(share())
  );

  updateCategories$ = new BehaviorSubject(1);
  categories$ = this.updateCategories$.pipe(
    switchMap((_) => this.posts.getCategories())
  );

  tags = signal<string[]>([]);

  draft = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    document: new FormControl(undefined, [EditorValidators.required()]),
    picture_wp: new FormControl<string | null>(null),
  });
  meta = new FormGroup({
    tags: new FormControl<string[]>([]),
    status: new FormControl(PostStatuses.Draft, [Validators.required]),
    category_id: new FormControl<string | null>(null, [
      this.validatePubCategoryId.bind(this),
    ]),
    shortname: new FormControl<null | string>(
      null,
      [
        Validators.minLength(3),
        Validators.maxLength(16),
        Validators.pattern(/^\w+$/),
      ],
      this.validateUniqueShortname.bind(this)
    ),
    enableLikes: new FormControl(true, [Validators.required]),
    enableComments: new FormControl(true, [Validators.required]),
  });
  editor = new Editor({
    plugins: [placeholderPlugin],
  });
  picture_wp$ = this.draft.get('picture_wp')!.valueChanges.pipe(shareReplay(1));
  title_class$ = this.picture_wp$.pipe(
    map((url) => (url ? 'title-imaged' : 'title-bordered'))
  );
  title_style$ = this.picture_wp$.pipe(
    map((url) =>
      url
        ? {
            background: [
              'linear-gradient(to right, rgba(0,0,0, 0.4))',
              `url(${url}) no-repeat center / cover`,
            ].join(', '),
          }
        : {}
    )
  );

  titleControlSubs = this.draft
    .get('title')!
    .valueChanges.pipe(filter(Boolean))
    .subscribe((title) => {
      const lines = title.split('\n');
      if (lines.length > 2) {
        this.draft
          .get('title')
          ?.setValue(lines[0] + '\n' + lines.slice(1).join(''));
      }
    });

  separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
  isApplyDisabled = false;

  // readonly newCatData = inject<AddCategoryResponse>(MAT_DIALOG_DATA);

  validatePubCategoryId(control: AbstractControl) {
    if (!this.meta) {
      return null;
    }
    if (this.meta.value.status != PostStatuses.Pub) {
      return null;
    }

    if (!control.value) {
      return { pubCategoryRequired: true };
    }

    return null;
  }

  validateUniqueShortname(control: AbstractControl) {
    const { value } = control;
    if (value == null || value.length < 3) {
      return of(null);
    }
    return this.shortnamesService
      .getShortname(value)
      .pipe(
        map((sn) =>
          sn && sn.post_id !== this.postId() ? { taken: true } : null
        )
      );
  }

  addNewCategory() {
    const dialogRef = this.dialog.open(NewCategoryDialogComponent, {
      restoreFocus: false,
    });
    dialogRef.afterClosed().subscribe((resp) => {
      if (!resp) {
        return;
      }
      this.updateCategories$.next(1);
    });
  }

  ngOnInit(): void {
    this.picture_wp$.pipe(takeUntil(this.destroy$)).subscribe();

    this.savedPost$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((post) => {
        this.draft.setValue({
          title: post.title || '',
          document: post.document,
          picture_wp: post.picture_wp,
        });

        this.tags.set(post.tags);
        this.meta.setValue({
          tags: post.tags,
          status: post.status,
          category_id: post.category_id || null,
          // TODO
          shortname: post.shortname,
          enableLikes: post.enable_likes,
          enableComments: post.enable_comments,
        });
      });
    this.draft.valueChanges
      .pipe(
        // skip(1),
        takeUntil(this.destroy$),
        filter((_) => this.draft.valid && this.draft.touched),
        debounceTime(1000),
        switchMap((form) => this.saveDraft(form))
      )
      .subscribe((changes) => {});
  }

  saveDraft(form: any, notify = true) {
    return this.posts
      .updateDraft(this.postId(), {
        title: form.title,
        document: form.document,
        picture_wp: form.picture_wp,
      })
      .pipe(
        tap((_) =>
          notify
            ? this.snackBar.open('Draft saved', undefined, { duration: 1000 })
            : null
        )
      );
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.editor?.destroy();
  }

  onWpSelected(event: Event) {
    const postId = this.postId();

    if (!postId) {
      return;
    }

    const target = event.target as HTMLInputElement;
    if (!target.files) {
      return;
    }
    const files: FileList = target.files;
    if (!files.length) {
      return;
    }
    const file = files[0];
    this.drive
      .putFile(postId, files[0])
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp) =>
        this.draft.get('picture_wp')!.setValue(resp.large || resp.original)
      );
  }

  applyChanges() {
    if (this.meta.invalid) {
      return;
    }

    this.isApplyDisabled = true;
    this.saveDraft(this.draft.value, false)
      .pipe(
        finalize(() => (this.isApplyDisabled = false)),
        switchMap((res) => {
          const meta = this.meta.value;
          return this.posts.applyChanges(this.postId(), {
            tags: meta.tags || [],
            status: meta.status || PostStatuses.Draft,
            category_id: meta.category_id || null,
            shortname: meta.shortname || null,
            enable_likes: meta.enableLikes || false,
            enable_comments: meta.enableComments || false,
          });
        }),
        catchError((err) => throwError(() => console.log(err))),
        takeUntil(this.destroy$)
      )
      .subscribe((_) => {
        const shortname = this.meta.get('shortname');
        this.router.navigate(
          shortname?.value && shortname?.valid
            ? [shortname.value]
            : ['/p/', this.postId()]
        );
      });
  }

  @HostListener('document:keydown.control.s', ['$event'])
  ctrlSHandler(event: KeyboardEvent) {
    event.preventDefault();
    this.saveDraft(this.draft.value).pipe(takeUntil(this.destroy$)).subscribe();
  }

  onAttachmentsSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files) {
      return;
    }
    const files: FileList = target.files;
    if (
      !this.editor.view.state.selection.$from.parent.inlineContent ||
      !files.length
    ) {
      return;
    }

    this.attachmentLoading = true;
    const obs$ = [];
    for (const file of files) {
      obs$.push(this.uploadFile(file));
    }

    concat(...obs$)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.snackBar.open('An error occurred when uploading', 'OK', {
            duration: 5000,
          });
          return throwError(() => err);
        }),
        finalize(() => (this.attachmentLoading = false))
      )
      .subscribe((result) => {
        const schema = this.editor.schema;
        const view = this.editor.view;
        const pos = findPlaceholder(view.state, result.id);

        if (pos == null) {
          return;
        }

        view.dispatch(
          view.state.tr
            .replaceWith(
              pos,
              pos,
              schema.nodes['image'].create({
                src: result.path,
              })
            )
            .setMeta(placeholderPlugin, { remove: { id: result.id } })
        );
      });
  }

  private uploadFile(file: File) {
    const pholdId = {};
    const view = this.editor.view;
    const tr = view.state.tr;

    if (!tr.selection.empty) {
      tr.deleteSelection();
    }
    tr.setMeta(placeholderPlugin, {
      add: { id: pholdId, pos: tr.selection.from },
    });
    view.dispatch(tr);

    const http$ = this.drive.putFile(this.postId(), file).pipe(
      catchError((err) => {
        view.dispatch(
          tr.setMeta(placeholderPlugin, { remove: { id: pholdId } })
        );
        return throwError(() => err);
      }),
      map((res) => {
        return { id: pholdId, path: res.medium || res.original };
      })
    );

    return http$;
  }
}
