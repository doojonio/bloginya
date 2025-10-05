import {
  Component,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Editor } from 'ngx-editor';
import {
  catchError,
  debounceTime,
  merge,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { AppService } from '../../../shared/services/app.service';
import { AsianHelpersService } from '../../services/asian-helpers.service';

@Component({
  selector: 'app-post-editor-root',
  standalone: false,
  template: `
    <div class="editor">
      <div class="menu-container">
        <ngx-editor-menu
          [editor]="editor()"
          [toolbar]="(toolbar$ | async)!"
          [colorPresets]="(colorPresets$ | async) || []"
          [customMenuRef]="customMenu"
        ></ngx-editor-menu>

        <ng-template #customMenu>
          <app-menu
            [editor]="editor()"
            (asianHelperClicked)="asianHelperClicked.next()"
          ></app-menu>
        </ng-template>
      </div>
      <ngx-editor
        [editor]="editor()"
        [formControl]="documentControl()"
        [class.app-rt-disabled]="!showAsianHelpers()"
      ></ngx-editor>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class PostEditorRootComponent implements OnInit, OnDestroy {
  editor = input.required<Editor>();
  documentControl = input.required<FormControl>();
  showAsianHelpers = model.required();

  private readonly appS = inject(AppService);
  private readonly asianS = inject(AsianHelpersService);

  asianHelperClicked = new Subject<void>();

  toolbar$ = this.appS.getEditorToolbar();
  colorPresets$ = this.appS.getEditorColorPallete();

  private destroy$ = new Subject<void>();

  ngOnInit() {
    merge(this.documentControl().valueChanges, this.asianHelperClicked)
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        switchMap((_) =>
          this.asianS
            .updateHelpers(this.editor())
            .pipe(catchError((_) => of(null)))
        )
      )
      .subscribe(() => {});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
