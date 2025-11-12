import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { DOMSerializer, Node } from 'prosemirror-model';
import {
  API_CONFIG,
  appConfig,
  PROSEMIRROR_SERVER_CONVERT,
} from './app.config';
import { serverRoutes } from './app.routes.server';
import { customSchema } from './prosemirror/schema';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: API_CONFIG,
      useValue: {
        backendUrl: 'http://backend:8080',
        coolAsiaUrl: 'http://cool_asia:8000/api/cool_asia',
        coolAudioUrl: 'http://cool_audio:8080/api/audio',
      },
    },
    {
      provide: PROSEMIRROR_SERVER_CONVERT,
      useValue: prosemirrorServerConvert,
    },
  ],
};

// thanks to Shivam https://stackoverflow.com/a/77927280
function prosemirrorServerConvert(doc: any) {
  const dom = require('happy-dom');
  const window = new dom.Window({ url: 'https://localhost:8080' });
  const document = window.document;

  document.body.innerHTML = '<div id="content"></div>';
  const contentDiv = document.getElementById('content');
  const docNode = Node.fromJSON(customSchema, doc);
  DOMSerializer.fromSchema(customSchema).serializeFragment(
    docNode.content,
    { document },
    contentDiv
  );

  return contentDiv.innerHTML;
}

export const config = mergeApplicationConfig(appConfig, serverConfig);
