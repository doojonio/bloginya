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
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Editor, Validators as EditorValidators } from 'ngx-editor';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatChipInputEvent } from '@angular/material/chips';
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
} from 'rxjs/operators';
import { NewCategoryDialogComponent } from '../../../category/category.module';
import { PostStatuses } from '../../../shared/interfaces/post-statuses.interface';
import { AppService } from '../../../shared/services/app.service';
import { NotifierService } from '../../../shared/services/notifier.service';
import { PictureService } from '../../../shared/services/picture.service';
import { ShortnamesService } from '../../../shared/services/shortnames.service';
import { UserService } from '../../../shared/services/user.service';
import { DriveService } from '../../services/drive.service';
import { EditorService } from '../../services/editor.service';
import {
  findPlaceholder,
  placeholderPlugin,
} from './plugins/placeholder.plugin';

@Component({
  selector: 'app-post-editor',
  standalone: false,
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.scss',
})
export class PostEditorComponent implements OnInit, OnDestroy {
  private readonly appS = inject(AppService);
  private readonly userS = inject(UserService);
  private readonly notifierS = inject(NotifierService);
  private readonly driveS = inject(DriveService);
  private readonly editS = inject(EditorService);
  private readonly shortnamesS = inject(ShortnamesService);
  private readonly router = inject(Router);
  private readonly picS = inject(PictureService);

  readonly dialog = inject(MatDialog);

  isHandset$ = this.appS.isHandset();
  private destroy$ = new Subject<void>();
  currentUser$ = this.userS.getCurrentUser();
  statuses$ = this.appS.getPostStatuses();
  STATUSES = [
    { name: 'Public', value: PostStatuses.Pub },
    { name: 'Draft', value: PostStatuses.Draft },
    { name: 'Del', value: PostStatuses.Del },
  ];

  toolbar$ = this.appS.getEditorToolbar();
  colorPresets$ = this.appS.getEditorColorPallete();
  attachmentLoading = false;

  postId = input.required<string>();
  savedPost$ = computed(() =>
    this.editS.getForEdit(this.postId()).pipe(share())
  );

  updateCategories$ = new BehaviorSubject(1);
  categories$ = this.updateCategories$.pipe(
    switchMap((_) => this.editS.getCategories())
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

  statusControlSubs = this.meta
    .get('status')!
    .valueChanges.pipe(takeUntilDestroyed())
    .subscribe((status) => {
      if (status == PostStatuses.Pub) {
        this.meta.get('category_id')!.setValidators([Validators.required]);
        this.meta.get('category_id')!.updateValueAndValidity();
      } else {
        this.meta.get('category_id')!.clearValidators();
        this.meta.get('category_id')!.updateValueAndValidity();
      }
    });

  separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
  isApplyDisabled = false;

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
          picture_wp: this.picS.variant(post.picture_wp, 'medium'),
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
      .subscribe((_) => {});
  }

  saveDraft(form: any) {
    return this.editS.updateDraft(this.postId(), {
      title: form.title,
      document: form.document,
      picture_wp: form.picture_wp,
    });
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

  wpLoading = false;
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

    this.wpLoading = true;
    this.driveS
      .putFile(postId, files[0])
      .pipe(
        finalize(() => (this.wpLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe((resp) =>
        this.draft
          .get('picture_wp')!
          .setValue(this.picS.variant(resp.id, 'medium'))
      );
  }

  applyChanges() {
    if (this.meta.invalid) {
      return;
    }

    this.isApplyDisabled = true;
    this.saveDraft(this.draft.value)
      .pipe(
        finalize(() => (this.isApplyDisabled = false)),
        switchMap((res) => {
          const meta = this.meta.value;
          return this.editS.applyChanges(this.postId(), {
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
          this.notifierS.notify('An error occurred when uploading', 'OK');
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

    const http$ = this.driveS.putFile(this.postId(), file).pipe(
      catchError((err) => {
        view.dispatch(
          tr.setMeta(placeholderPlugin, { remove: { id: pholdId } })
        );
        return throwError(() => err);
      }),
      map((res) => {
        return { id: pholdId, path: this.picS.variant(res.id, 'medium') };
      })
    );

    return http$;
  }
}
