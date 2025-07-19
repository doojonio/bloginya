import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { BreakpointMap } from './shared/services/picture.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withComponentInputBinding()
    ),
    provideHttpClient(),
    // TODO finish this shit
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        let dim = BreakpointMap[140];

        if (config.width && config.width in BreakpointMap) {
          dim = BreakpointMap[config.width];
        }
        return config.src + '?d=' + dim;
      },
    },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        breakpoints: [Object.keys(BreakpointMap).sort()],
      },
    },
  ],
};
