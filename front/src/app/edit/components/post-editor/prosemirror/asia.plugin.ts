import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// prosemirror plugin to search for kanji or chinese hanji text

const asiaPlugin = new Plugin({
  state: {
    init() {
      return { a: 123 };
    },
    apply(tr, pstate, oldState, newState) {
      return pstate;
    },
  },
  props: {},
});

export { asiaPlugin };
