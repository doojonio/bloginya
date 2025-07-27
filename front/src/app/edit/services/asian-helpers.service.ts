import { inject, Injectable } from '@angular/core';
import { Editor } from 'ngx-editor';
import { getMatchHighlights, search, SearchQuery } from 'prosemirror-search';
import { concat, last, tap } from 'rxjs';
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

    const observables = [];

    for (const dec of decorations.find()) {
      const mapping = tr.mapping;

      // delete old ruby marks
      tr.removeMark(
        mapping.map(dec.from),
        mapping.map(dec.to),
        state.schema.marks['ruby']
      );

      const text = tr.doc.textBetween(
        mapping.map(dec.from),
        mapping.map(dec.to)
      );

      observables.push(
        this.coolAsiaS.getHiragana(text).pipe(
          tap((hiragana) => {
            tr.addMark(
              mapping.map(dec.from),
              mapping.map(dec.to),
              state.schema.marks['ruby'].create({ rt: hiragana })
            );
          })
        )
      );
    }

    return concat(...observables).pipe(
      last(),
      tap(console.log),
      tap(() => {
        editor.view.dispatch(tr);
      })
    );
  }
}
