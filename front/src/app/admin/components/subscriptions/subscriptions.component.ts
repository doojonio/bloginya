import { Component, inject } from '@angular/core';
import { BehaviorSubject, finalize, switchMap } from 'rxjs';
import { AppService } from '../../../shared/services/app.service';
import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss',
  standalone: false,
})
export class SubscriptionsComponent {
  private readonly appService = inject(AppService);
  private readonly subscriptionService = inject(SubscriptionService);

  private update$ = new BehaviorSubject<boolean | undefined>(undefined);
  
  subscriptions$ = this.update$.pipe(
    switchMap((filter) => this.subscriptionService.getSubscriptions(filter))
  );

  isHandset$ = this.appService.isHandset();

  displayedColumns: string[] = [
    'username',
    'email',
    'subscribed',
    'created_at',
    'updated_at',
    'actions',
  ];

  filter: 'all' | 'subscribed' | 'unsubscribed' = 'all';
  loading = false;

  setFilter(filter: 'all' | 'subscribed' | 'unsubscribed') {
    this.filter = filter;
    if (filter === 'all') {
      this.update$.next(undefined);
    } else if (filter === 'subscribed') {
      this.update$.next(true);
    } else {
      this.update$.next(false);
    }
  }

  enableSubscription(userId: string) {
    this.loading = true;
    this.subscriptionService
      .enableSubscription(userId)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.update$.next(this.update$.value);
      });
  }

  disableSubscription(userId: string) {
    this.loading = true;
    this.subscriptionService
      .disableSubscription(userId)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.update$.next(this.update$.value);
      });
  }
}
