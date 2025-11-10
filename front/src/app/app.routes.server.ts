import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'me',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'not-found',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'drafts',
    renderMode: RenderMode.Client,
  },
  {
    path: 'nimda',
    renderMode: RenderMode.Client,
  },
  {
    path: 'e',
    renderMode: RenderMode.Client,
  },
  {
    path: 'profile',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  }
];
