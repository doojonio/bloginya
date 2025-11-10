import { NodeView } from 'prosemirror-view';

export class AudioPlayerView implements NodeView {
  dom: HTMLElement;
  constructor(node: any) {
    this.dom = document.createElement('ce-audio-player');
    this.dom.setAttribute('filename', node.attrs.filename);
  }
}
