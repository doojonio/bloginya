import { Component, inject, signal } from '@angular/core';
import {
  BehaviorSubject,
  map,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { DraftsService } from '../services/drafts.service';
import { GetDraftsItem } from '../drafts.interface';

@Component({
  selector: 'app-drafts',
  standalone: false,
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
})
export class DraftsComponent {
  private readonly draftsS = inject(DraftsService);
  private readonly updateDrafts$ = new BehaviorSubject<void>(undefined);

  draftsResponse$ = this.draftsS.getDrafts().pipe(
    shareReplay(1),
    tap((drafts) => {
      this.maxLength = Math.max(
        drafts.continue_edit.length,
        drafts.drafts.length
      );
    })
  );

  drafts = signal<GetDraftsItem[]>([]);
  conitnueEdit = signal<GetDraftsItem[]>([]);

  ngOnInit() {
    this.draftsResponse$.subscribe((resp) => {
      this.drafts.set(resp.drafts);
      this.conitnueEdit.set(resp.continue_edit);
    });
  }

  maxLength = 0;

  deleteDraft(postId: any) {
    this.draftsS.deleteDraft(postId).subscribe(() => this.hideDraft(postId));
  }

  private hideDraft(id: string) {
    this.drafts.update((drafts) => drafts.filter((draft) => draft.id != id));
  }
}
