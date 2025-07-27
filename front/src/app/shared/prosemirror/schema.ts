import { marks as basicMarks, nodes as basicNodes } from 'ngx-editor';
import { MarkSpec, Schema } from 'prosemirror-model';

// const ruby: NodeSpec = {
//   content: '(text*|rt?)',
//   inline: true,
//   group: 'inline',
//   parseDOM: [{ tag: 'ruby' }],
//   toDOM() {
//     return ['ruby', 0, ['rt', 0]];
//   },
// };

// const rt: NodeSpec = {
//   content: 'text*',
//   inline: true,
//   group: 'inline',
//   parseDOM: [{ tag: 'rt' }],
//   toDOM() {
//     return ['rt', 0];
//   },
// };

// const nodes = Object.assign({}, basicNodes, {
// });

// define ruby with rt MARK specification
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
    return ['ruby', ['span', 0], ['rt', { class: 'app-rt-enabled' }, rt]];
  },
};

const marks = Object.assign({}, basicMarks, {
  ruby,
});

const schema = new Schema({
  nodes: basicNodes,
  marks: marks,
});

export default schema;
