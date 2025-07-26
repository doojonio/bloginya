import { nodes as basicNodes, marks } from 'ngx-editor';
import { NodeSpec, Schema } from 'prosemirror-model';

const ruby: NodeSpec = {
  content: '(text*|rt?)',
  inline: true,
  group: 'inline',
  parseDOM: [{ tag: 'ruby' }],
  toDOM() {
    return ['ruby', 0, ['rt', 0]];
  },
};

const rt: NodeSpec = {
  content: 'text*',
  inline: true,
  group: 'inline',
  parseDOM: [{ tag: 'rt' }],
  toDOM() {
    return ['rt', 0];
  },
};

const nodes = Object.assign({}, basicNodes, {
  rt: rt,
  ruby: ruby,
});

const schema = new Schema({
  nodes,
  marks,
});

export default schema;
