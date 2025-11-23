import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  backendUrl: string;
  coolAudioUrl: string;
  coolAsiaUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('ApiConfigToken');

export const PROSEMIRROR_SERVER_CONVERT = new InjectionToken<
  (doc: any) => string
>('ProsemirrorServerConver');
