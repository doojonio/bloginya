import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { routes } from './app.routes';
import { API_CONFIG, PROSEMIRROR_SERVER_CONVERT } from './app.tokens';
import { BreakpointMap } from './shared/services/picture.service';
import { cookieInterceptor } from './ssr/cookie.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withComponentInputBinding()
    ),
    provideHttpClient(withFetch(), withInterceptors([cookieInterceptor])),
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        const width = config.width;

        let dim = BreakpointMap[40];
        for (const breakpoint of Object.keys(BreakpointMap)
          .map(Number)
          .sort((a, b) => a - b)) {
          if (width && width <= breakpoint) {
            dim = BreakpointMap[breakpoint];
            break;
          }
        }

        // console.log(config);
        // console.log(dim, config.src + '?d=' + dim);

        return config.src + '?d=' + dim;
      },
    },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        breakpoints: [Object.keys(BreakpointMap).sort()],
        placeholderResolution: 40,
      },
    },
    {
      provide: API_CONFIG,
      useValue: {
        backendUrl: '',
        coolAsiaUrl: '/api/cool_asia',
        coolAudioUrl: '/api/audio',
      },
    },
    {
      provide: PROSEMIRROR_SERVER_CONVERT,
      useValue: (_: any) => '',
    },
    provideClientHydration(withEventReplay()),
  ],
};
