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
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
import { concat, Subject, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  map,
  share,
  skip,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { AppService } from '../app.service';
import { DriveService } from '../drive.service';
import { PostsService, PostStatuses } from '../posts.service';
import { UserService } from '../user.service';
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
  private router = inject(Router);

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

  categories$ = this.posts.getCategories();

  picture = signal('');
  tags = signal<string[]>([]);

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    document: new FormControl(undefined, [
      EditorValidators.required(),
      EditorValidators.minLength(3),
    ]),
    tags: new FormControl<string[]>([]),
    status: new FormControl(PostStatuses.Draft),
    category_id: new FormControl<string | null>(null),
    shortname: new FormControl(''),
    enableLikes: new FormControl(true),
    enableComments: new FormControl(true),
  });
  editor = new Editor({
    plugins: [placeholderPlugin],
  });

  separatorKeysCodes = [ENTER, COMMA, SPACE] as const;

  ngOnInit(): void {
    this.savedPost$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((post) => {
        this.picture.set(post?.picture_wp || '');
        this.form.setValue({
          title: post.title || '',
          document: post.document,
          tags: post.tags,
          status: post.status,
          category_id: post.category_id || null,
          shortname: '',
          enableLikes: post.enable_likes,
          enableComments: post.enable_comments,
        });
      });

    this.form.valueChanges
      .pipe(
        skip(1),
        takeUntil(this.destroy$),
        filter((_) => this.form.valid && this.form.touched),
        debounceTime(1000),
        switchMap((form) => this.saveDraft(form))
      )
      .subscribe((changes) => {});
  }

  saveDraft(form: any) {
    return this.posts
      .updateDraft(this.postId(), {
        title: form!.title || '',
        document: form.document,
        picture_wp: this.picture(),
      })
      .pipe(
        catchError((err) => {
          this.snackBar.open('Error', 'Close', { duration: 5000 });
          return throwError(() => err);
        }),
        tap((_) =>
          this.snackBar.open('Draft saved', undefined, { duration: 1000 })
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
      .subscribe((resp) => this.picture.set(resp.large || resp.path));
  }

  applyChanges() {
    this.saveDraft(this.form.value)
      .pipe(
        switchMap((res) => {
          const form = this.form.value;
          return this.posts.applyChanges(this.postId(), {
            tags: form.tags || [],
            status: form.status || PostStatuses.Draft,
            category_id: form.category_id || null,
            shortname: form.shortname || null,
            enable_likes: form.enableLikes || false,
            enable_comments: form.enableComments || false,
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((_) => {
        const vals = this.form.value;
        this.router.navigate(
          vals.shortname ? [vals.shortname] : ['/p/', this.postId()]
        );
      });
  }

  @HostListener('document:keydown.control.s', ['$event'])
  ctrlSHandler(event: KeyboardEvent) {
    event.preventDefault();
    this.saveDraft(this.form.value).pipe(takeUntil(this.destroy$)).subscribe();
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
        return { id: pholdId, path: res.medium || res.path };
      })
    );

    return http$;
  }
}
