import {
  Component,
  computed,
  input,
  output,
  Signal,
  signal,
} from '@angular/core';
import { Editor } from 'ngx-editor';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import {
  addHelperMark,
  getSettledHelperType,
  removeHelperMark,
} from '../../prosemirror/helper-mark.plugin';

@Component({
  selector: 'app-menu',
  standalone: false,
  template: `
    <div class="NgxEditor__Seperator"></div>

    <mat-button-toggle-group
      name="Ruby"
      aria-label="Ruby"
      i18n-name
      i18n-aria-label
      [value]="selectedAsianHelper()"
    >
      @for (item of [hiragana, pinyin]; track item.title) {
      <mat-button-toggle
        (click)="asianHelperClicked.emit(item.key); item.onClick()"
        [value]="item.key"
        [value]="item.key"
        [title]="item.title"
        >{{ item.icon }}</mat-button-toggle
      >
      }
    </mat-button-toggle-group>
  `,
  styles: `
    @use '@angular/material' as mat;

    :host {
      display: flex;
      flex-flow: row wrap;
    }

    mat-button-toggle-group {
      @include mat.button-toggle-overrides((
        selected-state-background-color: var(--mat-sys-primary),
        selected-state-text-color: var(--mat-sys-on-primary),
        // state-layer-color: var(--mat-sys-primary),
        height: 30px,
        label-text-size: 10px,
        label-text-line-height: 10px,
        label-text-font: 10px,
        label-text-tracking: 10px,
        label-text-weight: bold,
      ));
    }

  `,
})
export class MenuComponent {
  editor = input.required<Editor>();

  hiragana = new HirganaMenuItem(this.editor);
  pinyin = new PinyinMenuItem(this.editor);

  asianHelpers = [this.hiragana, this.pinyin];

  asianHelperClicked = output<string>();

  selectedAsianHelper = computed(() => {
    const hiragana = this.hiragana.isActive();
    const pinyin = this.pinyin.isActive();

    if (hiragana) {
      return this.hiragana.key;
    } else if (pinyin) {
      return this.pinyin.key;
    } else {
      return '';
    }
  });

  ngOnInit(): void {
    for (const item of this.asianHelpers) {
      const plugin = new Plugin({
        key: new PluginKey(`menu-item-${item.key}`),
        view() {
          return {
            update(view) {
              return item.update(view);
            },
          };
        },
      });
      this.editor().registerPlugin(plugin);
    }
  }
}

class MenuItem {
  isActive = signal(false);
  key = '';

  icon = 'M';
  title = 'Menu Item';

  constructor(protected editor: Signal<Editor>) {}

  onClick() {}
  update(view: EditorView) {}
}

class AsianHelperMenuItem extends MenuItem {
  override key: 'hiragana' | 'pinyin' = 'hiragana';

  override onClick() {
    const editor = this.editor();
    const { view } = editor;
    const { state } = view;
    const { from, to, empty } = state.selection;

    if (empty) {
      return;
    }

    if (!this.isActive()) {
      const tr = addHelperMark(state.tr, from, to, this.key);
      view.dispatch(tr);
    } else {
      const tr = removeHelperMark(state.tr, from, to);
      view.dispatch(tr);
    }
  }

  override update(view: EditorView): void {
    const { state } = view;

    const { from, to } = state.selection;

    const type = getSettledHelperType(state, from, to);
    if (type == this.key) {
      this.isActive.set(true);
    } else {
      this.isActive.set(false);
    }
  }
}

class HirganaMenuItem extends AsianHelperMenuItem {
  override key: 'hiragana' = 'hiragana';
  override icon = 'F';
  override title = 'Hiragana';
}

class PinyinMenuItem extends AsianHelperMenuItem {
  override key: 'pinyin' = 'pinyin';
  override icon = 'P';
  override title = 'Pinyin';
}
