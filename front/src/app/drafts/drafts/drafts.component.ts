import { Component, inject } from '@angular/core';
import { map, shareReplay, tap } from 'rxjs';
import { DraftsService } from '../services/drafts.service';

@Component({
  selector: 'app-drafts',
  standalone: false,
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
})
export class DraftsComponent {
  draftsS = inject(DraftsService);
  draftsResponse$ = this.draftsS.getDrafts().pipe(
    shareReplay(1),
    tap((drafts) => {
      this.maxLength = Math.max(
        drafts.continue_edit.length,
        drafts.drafts.length
      );
    })
  );

  continueEdit$ = this.draftsResponse$.pipe(
    map((drafts) => drafts.continue_edit)
  );
  drafts$ = this.draftsResponse$.pipe(map((drafts) => drafts.drafts));

  maxLength = 0;
}
