import { marks as basicMarks, nodes as basicNodes } from 'ngx-editor';
import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model';

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

const audioPlayerNode: NodeSpec = {
  group: 'block',
  attrs: { filename: { validate: 'string' } },
  toDOM(node) {
    return ['ce-audio-player', { filename: node.attrs['filename'] }];
  },
  parseDOM: [
    {
      tag: 'ce-audio-player',
      getAttrs(dom: HTMLElement) {
        return { filename: dom.getAttribute('filename') };
      },
    },
  ],
};

const mapsIframeNode: NodeSpec = {
  group: 'block',
  attrs: { src: { validate: 'string' } },
  toDOM(node) {
    return [
      'div',
      {
        class: 'maps-container',
        style: 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;',
      },
      [
        'iframe',
        {
          src: node.attrs['src'],
          style: 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;',
          allowfullscreen: '',
          loading: 'lazy',
          referrerpolicy: 'no-referrer-when-downgrade',
        },
      ],
    ];
  },
  parseDOM: [
    {
      tag: 'div.maps-container',
      getAttrs(dom: HTMLElement) {
        const iframe = dom.querySelector('iframe');
        return iframe ? { src: iframe.getAttribute('src') } : false;
      },
    },
  ],
};

export const customSchema = new Schema({
  nodes: { ...basicNodes, ce_audio_player: audioPlayerNode, maps_iframe: mapsIframeNode },
  marks: marks,
});
