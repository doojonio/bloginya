import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Editor, NgxEditorModule, Toolbar, Validators } from 'ngx-editor';

import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { concat, Subject, throwError } from 'rxjs';
import { catchError, finalize, map, takeUntil } from 'rxjs/operators';
import { BlogsService, GetBlogResponse } from '../blogs.service';
import { DriveService } from '../drive.service';
import { findPlaceholder, placeholderPlugin } from './placeholder-plugin';

// https://prosemirror.net/examples/upload/
// FOR Image clicks
// class ImageView {
//   constructor(node) {
//     // The editor will use this as the node's DOM representation
//     this.dom = document.createElement("img")
//     this.dom.src = node.attrs.src
//     this.dom.addEventListener("click", e => {
//       console.log("You clicked me!")
//       e.preventDefault()
//     })
//   }

@Component({
  selector: 'app-blog-editor',
  imports: [
    MatProgressSpinnerModule,
    NgxEditorModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './blog-editor.component.html',
  styleUrl: './blog-editor.component.scss',
})
export class BlogEditorComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private drive = inject(DriveService);
  private blogs = inject(BlogsService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private router = inject(Router);

  blogId: string | null | undefined;
  isBlogPublic: boolean = false;

  attachmentLoading = false;
  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3'] }],
    ['link'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  private destroy$ = new Subject<void>();

  form: FormGroup | undefined;
  editor = new Editor({ plugins: [placeholderPlugin] });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.blogId = params.get('id');
      if (!this.blogId) {
        this.createEditor(null);
        return;
      }
      this.blogs
        .getBlog(this.blogId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((blog) => {
          this.createEditor(blog);
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.editor?.destroy();
  }

  createEditor(blog: GetBlogResponse | null) {
    let jsonDoc = { type: 'doc', content: [] };
    if (blog != null) {
      jsonDoc = blog.document.doc;
    }

    this.form = new FormGroup({
      editorContent: new FormControl({ value: jsonDoc, disabled: false }, [
        Validators.required(),
        Validators.minLength(10),
      ]),
    });
  }

  publish() {
    // TODO join save login with save() method
    this.blogs
      .saveBlog(
        this.editor.view.state.toJSON(),
        this.blogId ? this.blogId : undefined
      )
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.snackBar.open('An error occurred when saving document', 'OK', {
            duration: 5000,
          });
          return throwError(() => err);
        })
      )
      .subscribe((id) => {
        this.router.navigate(['/publish'], {queryParams: {id}});
      });
  }

  save() {
    if (this.form?.invalid) {
      return;
    }

    this.blogs
      .saveBlog(
        this.editor.view.state.toJSON(),
        this.blogId ? this.blogId : undefined
      )
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.snackBar.open('An error occurred when saving document', 'OK', {
            duration: 5000,
          });
          return throwError(() => err);
        })
      )
      .subscribe((rId) => {
        if (!this.blogId) {
          this.blogId = rId;
          this.location.replaceState(`/edit/${this.blogId}`);
        }

        this.snackBar.open(
          (this.isBlogPublic ? 'Blog' : 'Draft') + ' saved',
          'OK',
          { duration: 5000 }
        );
      });
  }

  @HostListener('document:keydown.control.s', ['$event'])
  ctrlSHandler(event: KeyboardEvent) {
    if (!this.form) {
      return;
    }
    event.preventDefault();
    this.save();
  }

  onFilesSelected(event: Event) {
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
      .subscribe((result: any) => {
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
              schema.nodes['image'].create({ src: result.path })
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

    const http$ = this.drive.putFile(file).pipe(
      catchError((err) => {
        view.dispatch(
          tr.setMeta(placeholderPlugin, { remove: { id: pholdId } })
        );
        return throwError(() => err);
      }),
      map(({ path }) => {
        return { id: pholdId, path };
      })
    );

    return http$;
  }
}
