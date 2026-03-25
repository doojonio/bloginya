import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.tokens';

@Injectable()
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  getSubscriptions(subscribed?: boolean) {
    let url = this.api.backendUrl + '/api/admin/subscription/list';
    if (subscribed !== undefined) {
      url += `?subscribed=${subscribed}`;
    }
    return this.http.get<SubscriptionItem[]>(url);
  }

  enableSubscription(userId: string) {
    return this.http.post(
      this.api.backendUrl + '/api/admin/subscription/enable',
      null,
      {
        params: {
          user_id: userId,
        },
      }
    );
  }

  disableSubscription(userId: string) {
    return this.http.post(
      this.api.backendUrl + '/api/admin/subscription/disable',
      null,
      {
        params: {
          user_id: userId,
        },
      }
    );
  }
}

export interface SubscriptionItem {
  user_id: string;
  username: string;
  email: string;
  subscribed: boolean;
  created_at: string;
  updated_at: string;
}
