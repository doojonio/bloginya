import {
  Component,
  computed,
  HostListener,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Editor, Validators as EditorValidators } from 'ngx-editor';

import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EMPTY,
  merge,
  Observable,
  of,
  ReplaySubject,
  Subject,
  throwError,
} from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  map,
  shareReplay,
  skip,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { customSchema } from '../../../prosemirror/schema';
import { PostStatuses } from '../../../shared/interfaces/entities.interface';
import { NotifierService } from '../../../shared/services/notifier.service';
import { PictureService } from '../../../shared/services/picture.service';
import { helperMarkPlugin } from '../../prosemirror/helper-mark.plugin';
import {
  placeholderPlugin,
  removePlaceholder,
  replacePlaceholderWithNode,
  setPlaceholder,
} from '../../prosemirror/placeholder.plugin';
import { AsianHelpersService } from '../../services/asian-helpers.service';
import { DriveService } from '../../services/drive.service';
import { EditorService } from '../../services/editor.service';
import { MetaValue } from '../meta-editor/meta-editor.component';
import { PhotoManagerComponent } from '../photo-manager/photo-manager.component';

@Component({
  selector: 'app-post-editor',
  standalone: false,
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.scss',
})
export class PostEditorComponent implements OnInit, OnDestroy {
  private readonly notifierS = inject(NotifierService);
  private readonly driveS = inject(DriveService);
  private readonly editS = inject(EditorService);
  private readonly router = inject(Router);
  private readonly picS = inject(PictureService);
  private readonly asianS = inject(AsianHelpersService);
  private readonly route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  isWallpaperLoading = false;
  isAttachmentLoading = false;
  isShowPhotoManager = false;
  isApplyDisabled = false;
  hasUnsavedChanges = false;
  showAsianHelpers = true;

  postId = input.required<string>();
  savedPost$ = toObservable(this.postId).pipe(
    switchMap((postId) => this.editS.getForEdit(this.postId())),
    shareReplay(1)
  );

  metaValueSubject$ = new ReplaySubject<MetaValue>(1);

  draft = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    document: new FormControl(undefined, [
      EditorValidators.required(customSchema),
    ]),
    picture_wp: new FormControl<string | null>(null),
    picture_pre: new FormControl<string | null>(null),
  });
  editor = new Editor({
    plugins: [
      placeholderPlugin,
      this.asianS.getSearchPlugin(),
      helperMarkPlugin,
    ],
    schema: customSchema,
  });

  @ViewChild('photoManager')
  photoManager?: PhotoManagerComponent;

  documentControl = computed(() => this.draft.get('document')! as FormControl);
  previewControl = computed(
    () => this.draft.get('picture_pre')! as FormControl
  );
  wallpaperControl = computed(
    () => this.draft.get('picture_wp')! as FormControl
  );

  selectedImage = signal<string | null>(null);
  _ = toObservable(this.selectedImage)
    .pipe(takeUntilDestroyed())
    .subscribe((image) => {
      this.draft.get('picture_pre')?.setValue(image);
    });

  ngOnInit(): void {
    this.savedPost$.pipe(takeUntil(this.destroy$)).subscribe((post) => {
      this.selectedImage.set(post.picture_pre);
      this.draft.setValue({
        title: post.title || '',
        document: post.document,
        picture_wp: this.picS.variant(post.picture_wp, 'medium'),
        picture_pre: post.picture_pre,
      });
      this.metaValueSubject$.next(post);
    });

    this.draft.valueChanges
      .pipe(
        skip(1),
        takeUntil(this.destroy$),
        tap((_) => (this.hasUnsavedChanges = true)),
        filter((_) => this.draft.valid),
        debounceTime(1000),
        switchMap((form) =>
          this.saveDraft(form).pipe(catchError((_) => of(null)))
        )
      )
      .subscribe(() => {});
  }

  saveDraft(form: any) {
    if (!this.isValidDocument(form.document)) {
      return throwError(() => new Error('Invalid document'));
    }

    return this.editS
      .updateDraft(this.postId(), {
        title: form.title,
        document: form.document,
        picture_wp: form.picture_wp,
        picture_pre: form.picture_pre,
      })
      .pipe(tap(() => (this.hasUnsavedChanges = false)));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.editor?.destroy();
  }

  onMetaApply(meta: MetaValue) {
    this.isApplyDisabled = true;
    this.saveDraft(this.draft.value)
      .pipe(
        finalize(() => (this.isApplyDisabled = false)),
        switchMap((_) => {
          return this.editS.applyChanges(this.postId(), {
            tags: meta.tags || [],
            status: meta.status || PostStatuses.Draft,
            category_id: meta.category_id || null,
            shortname: meta.shortname || null,
            enable_likes: meta.enable_likes || false,
            enable_comments: meta.enable_comments || false,
          });
        }),
        catchError((err) => throwError(() => {})),
        takeUntil(this.destroy$)
      )
      .subscribe((_) => {
        const shortname = meta.shortname;
        this.router.navigate(shortname ? [shortname] : ['/p/', this.postId()]);
      });
  }

  @HostListener('document:keydown.control.s', ['$event'])
  ctrlSHandler(event: Event) {
    event.preventDefault();
    this.saveDraft(this.draft.value).pipe(takeUntil(this.destroy$)).subscribe();
  }

  onAttachmentsSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) {
      return;
    }
    const files = Array.from(target.files);

    const uploadOps$: Observable<any>[] = [];

    for (const file of files) {
      if (
        file.type.startsWith('image') &&
        this.editor.view.state.selection.$from.parent.inlineContent
      ) {
        uploadOps$.push(
          this.uploadPostImage(file).pipe(
            tap((result) => {
              replacePlaceholderWithNode(
                this.editor.view,
                result.id,
                this.editor.schema.nodes['image'].create({
                  src: result.path,
                })
              );
            })
          )
        );
      } else if (file.type.startsWith('audio')) {
        // uploadOps$.push(this.uploadPostAudio(file));
      }
    }

    if (uploadOps$.length === 0) {
      return;
    }

    this.isAttachmentLoading = true;

    merge(...uploadOps$)
      .pipe(
        finalize(() => {
          this.isAttachmentLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private uploadPostImage(file: File) {
    const view = this.editor.view;
    const placeholderId = setPlaceholder(this.editor.view);

    const http$ = this.driveS.putFile(this.postId(), file).pipe(
      catchError((err) => {
        removePlaceholder(view, placeholderId);
        this.notifierS.notify('An error occurred when uploading', 'OK');
        // Return EMPTY to complete this stream without emitting anything and allow other uploads to continue.
        return EMPTY;
      }),
      map((res) => {
        return { id: placeholderId, path: this.picS.variant(res.id, 'medium') };
      })
    );

    return http$;
  }

  private uploadPostAudio(file: File) {
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
        this.notifierS.notify('An error occurred when uploading', 'OK');
        // Return EMPTY to complete this stream without emitting anything and allow other uploads to continue.
        return EMPTY;
      }),
      map((res) => {
        return { id: pholdId, path: this.picS.variant(res.id, 'medium') };
      })
    );

    return http$;
  }

  isValidDocument(document: any) {
    try {
      customSchema.nodeFromJSON(JSON.parse(JSON.stringify(document))).check();
    } catch (error) {
      this.notifierS.notify(
        `Bad Document! Contact Developer! (error: ${error})`
      );
      return null;
    }

    return true;
  }

  openPhotoManager() {
    this.isShowPhotoManager = true;
  }

  applyPhotoManager() {
    this.photoManager?.applyChanges();
    this.isShowPhotoManager = false;
  }
}
