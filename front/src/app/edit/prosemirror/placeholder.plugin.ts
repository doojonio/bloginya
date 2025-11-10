import { Node } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const placeholderPlugin = new Plugin({
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, decSet) {
      decSet = decSet.map(tr.mapping, tr.doc);

      let meta = tr.getMeta(placeholderPlugin);

      if (meta && meta.add) {
        let widget = document.createElement('placeholder');
        let deco = Decoration.widget(meta.add.pos, widget, { id: meta.add.id });
        decSet = decSet.add(tr.doc, [deco]);
      } else if (meta && meta.remove) {
        decSet = decSet.remove(
          decSet.find(undefined, undefined, (spec) => spec.id == meta.remove.id)
        );
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

function findPlaceholder(state: any, id: any) {
  let decSet = placeholderPlugin.getState(state);
  let found = decSet?.find(undefined, undefined, (spec) => spec.id == id);

  if (found && found.length) {
    return found[0].from;
  }

  return null;
}

function setPlaceholder(view: any) {
  const placeholderId = {};
  const tr = view.state.tr;

  if (!tr.selection.empty) {
    tr.deleteSelection();
  }
  tr.setMeta(placeholderPlugin, {
    add: { id: placeholderId, pos: tr.selection.from },
  });
  view.dispatch(tr);

  return placeholderId;
}

function removePlaceholder(view: any, id: any) {
  view.dispatch(view.state.tr.setMeta(placeholderPlugin, { remove: { id } }));
}

function replacePlaceholderWithNode(view: any, placeholderId: any, node: Node) {
  const pos = findPlaceholder(view.state, placeholderId);

  if (pos == null) {
    return;
  }

  view.dispatch(
    view.state.tr
      .replaceWith(pos, pos, node)
      .setMeta(placeholderPlugin, { remove: { id: placeholderId } })
  );

  return node;
}

export {
  findPlaceholder,
  placeholderPlugin,
  setPlaceholder,
  removePlaceholder,
  replacePlaceholderWithNode,
};
