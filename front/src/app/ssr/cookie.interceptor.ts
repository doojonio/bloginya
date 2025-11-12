import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';

export const cookieInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformServer(platformId)) {
    return next(req);
  }

  const serverRequest = inject(REQUEST);
  if (!serverRequest) {
    return next(req);
  }

  const cookieHeader =
    serverRequest.headers.get('Cookie') || serverRequest.headers.get('cookie');

  if (cookieHeader) {
    // 2. Clone the outgoing HttpClient request and set the 'Cookie' header manually.
    const clonedRequest = req.clone({
      setHeaders: {
        Cookie: cookieHeader,
      },
    });
    return next(clonedRequest);
  }
  return next(req);
};
