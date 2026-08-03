import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { timeout } from 'rxjs/operators';

const SSR_TIMEOUT_MS = 8000;

export const ssrTimeoutInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformServer(inject(PLATFORM_ID))) {
    return next(req);
  }
  return next(req).pipe(timeout(SSR_TIMEOUT_MS));
};
