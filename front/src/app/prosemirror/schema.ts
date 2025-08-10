import { marks as basicMarks, nodes as basicNodes } from 'ngx-editor';
import { MarkSpec, Schema } from 'prosemirror-model';

const ruby: MarkSpec = {
  attrs: {
    rt: { default: '' },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'ruby',
      getAttrs(dom) {
        const rt = dom.getElementsByTagName('rt');
        if (rt.length == 0) {
          return {};
        }
        return {
          rt: rt[0].innerText,
        };
      },
    },
  ],
  toDOM(node) {
    const { rt } = node.attrs;
    return [
      'ruby',
      ['span', 0],
      ['rt', { contenteditable: 'false', style: 'user-select: none;' }, rt],
    ];
  },
};

const marks = Object.assign({}, basicMarks, {
  ruby,
});

// FIXME: when ngx editor will fix order problem : remove
// https://github.com/sibiraj-s/ngx-editor/issues/592
basicNodes.ordered_list!.attrs!['order'].validate = 'number|null';

export const customSchema = new Schema({
  nodes: basicNodes,
  marks: marks,
});
