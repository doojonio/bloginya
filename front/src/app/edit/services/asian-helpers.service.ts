import { inject, Injectable } from '@angular/core';
import { Editor } from 'ngx-editor';
import { Mark } from 'prosemirror-model';
import { getMatchHighlights, search, SearchQuery } from 'prosemirror-search';
import { merge, of, tap } from 'rxjs';
import { getSettledHelperType } from '../prosemirror/helper-mark.plugin';
import { CoolAsiaService } from './cool-asia.service';

@Injectable()
export class AsianHelpersService {
  private readonly query = new SearchQuery({
    search: '\\p{Script=Han}',
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
    const tr = state.tr;
    const mapping = tr.mapping;

    const hiraganaMarks: {
      from: number;
      to: number;
      text: string;
    }[] = [];

    const pinyinMarks: {
      from: number;
      to: number;
      text: string;
    }[] = [];

    for (const dec of decorations.find()) {
      const fromMapped = mapping.map(dec.from);
      const toMapped = mapping.map(dec.to);

      const text = tr.doc.textBetween(fromMapped, toMapped);
      // const isInRubyTag =

      let marks: Mark[] = [];
      state.doc.nodesBetween(fromMapped, toMapped, (node) => {
        marks = [...marks, ...node.marks];
      });
      const hasRubyMarks = marks.some((mark) => mark.type.name === 'ruby');

      const type = getSettledHelperType(state, dec.from, dec.to);

      if (type === 'pinyin') {
        pinyinMarks.push({
          from: dec.from,
          to: dec.to,
          text,
        });
      } else if (!hasRubyMarks || type === 'hiragana') {
        hiraganaMarks.push({
          from: dec.from,
          to: dec.to,
          text,
        });
      }
    }

    if (hiraganaMarks.length === 0 && pinyinMarks.length === 0) {
      return of();
    }

    const obs = [];

    if (hiraganaMarks.length > 0) {
      obs.push(
        this.coolAsiaS
          .getHiraganas(hiraganaMarks.map((item) => item.text))
          .pipe(
            tap((hiraganas) => {
              for (let i = 0; i < hiraganas.length; i++) {
                const hiragana = hiraganas[i];
                const item = hiraganaMarks[i];
                tr.addMark(
                  mapping.map(item.from),
                  mapping.map(item.to),
                  state.schema.marks['ruby'].create({ rt: hiragana })
                );
              }
              editor.view.dispatch(tr);
            })
          )
      );
    }
    if (pinyinMarks.length > 0) {
      obs.push(
        this.coolAsiaS.getPinyins(pinyinMarks.map((item) => item.text)).pipe(
          tap((pinyins) => {
            for (let i = 0; i < pinyins.length; i++) {
              const pinyin = pinyins[i];
              const item = pinyinMarks[i];
              tr.addMark(
                mapping.map(item.from),
                mapping.map(item.to),
                state.schema.marks['ruby'].create({ rt: pinyin })
              );
            }
            editor.view.dispatch(tr);
          })
        )
      );
    }

    return merge(...obs);
  }
}
