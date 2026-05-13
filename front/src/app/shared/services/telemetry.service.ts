import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  DestroyRef,
  ErrorHandler,
  inject,
  Injectable,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, bufferTime } from 'rxjs';
import { API_CONFIG } from '../../app.tokens';

interface TelemetryPayload {
  page_load_ms?: number;
  errors?: { type: string; msg: string }[];
  route?: string;
  post_read_seconds?: number;
  post_id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private readonly api = inject(API_CONFIG);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly errorQueue: { type: string; msg: string }[] = [];
  private readonly navigationSubject = new Subject<string>();

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.trackNavigation();
    this.trackPageLoad();
    this.startFlush();
  }

  private postReadStart: number | null = null;
  private postReadId: string | null = null;

  trackPostReadStart(postId: string): void {
    this.postReadStart = Date.now();
    this.postReadId = postId;
  }

  trackPostReadEnd(): void {
    if (this.postReadStart === null || this.postReadId === null) {
      return;
    }
    const seconds = Math.round((Date.now() - this.postReadStart) / 1000);
    if (seconds > 0) {
      this.send({ post_read_seconds: seconds, post_id: this.postReadId });
    }
    this.postReadStart = null;
    this.postReadId = null;
  }

  reportError(type: string, msg: string): void {
    this.errorQueue.push({ type, msg: msg.substring(0, 200) });
  }

  private trackNavigation(): void {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        this.navigationSubject.next((e as NavigationEnd).urlAfterRedirects);
      });
  }

  private trackPageLoad(): void {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    const sendTiming = (entry: PerformanceNavigationTiming): void => {
      const loadTime = entry.loadEventEnd - entry.startTime;
      if (loadTime > 0) {
        this.send({ page_load_ms: Math.round(loadTime) });
      }
    };

    // Try to get timing directly first (works if page already loaded)
    const existingTiming = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (existingTiming?.loadEventEnd) {
      sendTiming(existingTiming);
      return;
    }

    // If not available yet, use PerformanceObserver
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          sendTiming(entry as PerformanceNavigationTiming);
        }
      }
      observer.disconnect();
    });

    try {
      observer.observe({ type: 'navigation', buffered: true });
      // Fallback: if observer doesn't fire within 5s, check again
      setTimeout(() => {
        observer.disconnect();
        const timing = performance.getEntriesByType('navigation')[0] as
          | PerformanceNavigationTiming
          | undefined;
        if (timing?.loadEventEnd) {
          sendTiming(timing);
        }
      }, 5000);
    } catch {
      // Browser doesn't support PerformanceObserver for navigation
    }
  }

  private startFlush(): void {
    // Batch navigation events every 30 seconds
    this.navigationSubject
      .pipe(bufferTime(30_000), takeUntilDestroyed(this.destroyRef))
      .subscribe((routes) => {
        if (routes.length === 0 && this.errorQueue.length === 0) {
          return;
        }

        // Send one payload per route navigation
        for (const route of routes) {
          this.send({ route });
        }

        // Flush errors
        if (this.errorQueue.length > 0) {
          this.send({ errors: this.errorQueue.splice(0) });
        }
      });
  }

  private send(payload: TelemetryPayload): void {
    this.http
      .post(this.api.backendUrl + '/api/telemetry', payload)
      .subscribe({ error: () => {} });
  }
}

@Injectable({
  providedIn: 'root',
})
export class TelemetryErrorHandler implements ErrorHandler {
  private readonly telemetry = inject(TelemetryService);

  handleError(error: any): void {
    const msg =
      error?.message || error?.toString?.() || 'Unknown error';
    this.telemetry.reportError('js', msg);
    console.error(error);
  }
}
