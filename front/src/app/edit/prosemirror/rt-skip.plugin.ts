import { Plugin, PluginKey } from 'prosemirror-state';
import { DecorationSet } from 'prosemirror-view';

export const rtSkipKey = new PluginKey('helperMarkPlugin');
// TODO
export const rtSkipPlugin = new Plugin({
  state: {
    init() {},
    apply(tr) {
    },
  },
  props: {
    handleKeyDown(view, event) {
    },
  },
});
