import { Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const helperMarkKey = new PluginKey('helperMarkPlugin');
export const helperMarkPlugin = new Plugin({
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, decSet) {
      decSet = decSet.map(tr.mapping, tr.doc);

      let meta = tr.getMeta(helperMarkKey);

      if (meta?.remove) {
        decSet = decSet.remove(decSet.find(meta.remove.from, meta.remove.to));
      }
      if (meta?.add) {
        let deco = Decoration.inline(
          meta.add.from,
          meta.add.to,
          {},
          {
            type: meta.add.type,
          }
        );
        decSet = decSet.add(tr.doc, [deco]);
      }

      return decSet;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

export function addHelperMark(
  tr: Transaction,
  from: number,
  to: number,
  type: 'hiragana' | 'pinyin'
) {
  return tr.setMeta(helperMarkKey, {
    remove: { from, to },
    add: { from, to, type },
  });
}

export function removeHelperMark(tr: Transaction, from: number, to: number) {
  return tr.setMeta(helperMarkKey, {
    remove: { from, to },
  });
}

export function getSettledHelperType(state: any, from: number, to: number) {
  let decSet = helperMarkPlugin.getState(state);
  let found = decSet?.find(from, to);

  if (found?.length) {
    return found[0].spec.type;
  }

  return null;
}
