import {
  afterNextRender,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { debounceTime, Observable, Subscription } from 'rxjs';

// Code written with help of prototyp.digital
// https://prototyp.digital/blog/how-to-implement-intersection-observer-api-in-angular
@Directive({
  selector: '[appVisibility]',
  exportAs: 'visibility',
})
export class VisibilityDirective implements OnDestroy {
  @Input() root: HTMLElement | null = null;
  @Input() rootMargin = '0px 0px 0px 0px';
  @Input() threshold = 0;
  @Input() debounceTime = 250;
  @Input() isContinuous = true;

  @Output() isIntersecting = new EventEmitter<boolean>();

  intersecting = false;
  subs: Subscription | undefined;

  constructor(private el: ElementRef) {
    afterNextRender(() => {
      this.subs = this.createAndObserve();
    });
  }

  // ngOnInit(): void {}
  ngOnDestroy(): void {
    this.subs?.unsubscribe();
  }

  createAndObserve() {
    const options: IntersectionObserverInit = {
      root: this.root,
      rootMargin: this.rootMargin,
      threshold: this.threshold,
    };

    return new Observable<boolean>((subscriber) => {
      const intersectionObserver = new IntersectionObserver((entries) => {
        const { isIntersecting } = entries[0];
        subscriber.next(isIntersecting);

        isIntersecting &&
          !this.isContinuous &&
          intersectionObserver.disconnect();
      }, options);

      intersectionObserver.observe(this.el.nativeElement);

      return {
        unsubscribe() {
          intersectionObserver.disconnect();
        },
      };
    })
      .pipe(debounceTime(this.debounceTime))
      .subscribe((status) => {
        this.isIntersecting.emit(status);
        this.intersecting = status;
      });
  }
}
