import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Editor,
  Validators as EditorValidators,
  NgxEditorModule,
} from 'ngx-editor';

import { AsyncPipe, Location } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { concat, Subject, throwError } from 'rxjs';
import { catchError, finalize, map, share, takeUntil } from 'rxjs/operators';
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
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private router = inject(Router);

  isHandset$ = this.appService.isHandset();
  private destroy$ = new Subject<void>();
  currentUser$ = this.userService.getCurrentUser();

  postId = input.required<string>();
  savedPost$ = computed(() => this.posts.get(this.postId()).pipe(share()));
  colorPresets$ = this.appService.getEditorColorPallete();
  picture = signal('');

  attachmentLoading = false;
  toolbar$ = this.appService.getEditorToolbar();

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    picture: new FormControl<string>(''),
    editorContent: new FormControl(undefined, [
      EditorValidators.required(),
      EditorValidators.minLength(3),
    ]),
    tags: new FormControl<string[]>([]),
    status: new FormControl<PostStatuses>(PostStatuses.Draft),
    category: new FormControl<string | null>(null),
    shortname: new FormControl(''),
    enableLikes: new FormControl(true),
    enableComments: new FormControl(true),
  });
  editor = new Editor({
    plugins: [placeholderPlugin],
  });

  separatorKeysCodes = [ENTER, COMMA] as const;

  ngOnInit(): void {
    this.savedPost$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((post) => {
        this.form.setValue({
          title: post.title || '',
          picture: post.picture || null,
          editorContent: post.draft || post.document,
          tags: [],
          status: post.status,
          category: '',
          shortname: '',
          enableLikes: true,
          enableComments: true,
        });
      });
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

  // @HostListener('document:keydown.control.s', ['$event'])
  // ctrlSHandler(event: KeyboardEvent) {
  //   if (!this.form) {
  //     return;
  //   }
  //   event.preventDefault();
  //   // this.save();
  // }

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
