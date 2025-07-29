import { inject, Injectable } from '@angular/core';
import { Editor } from 'ngx-editor';
import { getMatchHighlights, search, SearchQuery } from 'prosemirror-search';
import { tap } from 'rxjs';
import { CoolAsiaService } from './cool-asia.service';

@Injectable()
export class AsianHelpersService {
  private readonly query = new SearchQuery({
    search: '\\p{Script=Han}+',
    regexp: true,
  });
  private readonly plugin = search({ initialQuery: this.query });
  private coolAsiaS = inject(CoolAsiaService);

  constructor() {}

  getSearchPlugin() {
    return this.plugin;
  }

  updateHelpers(editor: Editor) {
    const decorations = getMatchHighlights(editor.view.state);
    const state = editor.view.state;
    // console.log(editor.schema.marks);
    const tr = state.tr;
    const mapping = tr.mapping;

    const marks: {
      from: number;
      to: number;
      text: string;
    }[] = [];

    for (const dec of decorations.find()) {
      const text = tr.doc.textBetween(
        mapping.map(dec.from),
        mapping.map(dec.to)
      );

      // remove all SHIBAL marks

      marks.push({
        from: dec.from,
        to: dec.to,
        text,
      });
    }

    return this.coolAsiaS.getHiraganas(marks.map((item) => item.text)).pipe(
      tap((hiraganas) => {
        for (let i = 0; i < hiraganas.length; i++) {
          const hiragana = hiraganas[i];
          const item = marks[i];
          tr.addMark(
            mapping.map(item.from),
            mapping.map(item.to),
            state.schema.marks['ruby'].create({ rt: hiragana })
          );
        }
        editor.view.dispatch(tr);
      })
    );
  }
}
