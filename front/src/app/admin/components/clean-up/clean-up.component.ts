import { Component, computed, DebugNode, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CleanUpService } from '../../services/clean-up.service';
import { BehaviorSubject, finalize, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-clean-up',
  standalone: false,
  template: `
    <h1>Clean Up</h1>
    <p>sessions: {{ sessions() }}</p>
    <p>files: {{ filesCount() }}</p>
    <p>file copies (smaller sizes): {{ copiesCount() }}</p>
    <p>overall files size: {{ filesSize() || 0 | filesize }}</p>

    <button matButton="filled" [disabled]="loading" (click)="cleanUp()">
      Clean Up!
    </button>
  `,
  styles: `
    :host {
      display: block;
    }

    p {
       margin: 0;
    }

    button {
      margin-top: 1rem;
    }
  `,
})
export class CleanUpComponent {
  private readonly cleanUpS = inject(CleanUpService);

  private update$ = new BehaviorSubject<void>(undefined);

  private estimated = toSignal(
    this.update$.pipe(switchMap(() => this.cleanUpS.estimate()))
  );

  sessions = computed(() => this.estimated()?.sessions);
  filesSize = computed(() => this.estimated()?.files_size);
  filesCount = computed(() => this.estimated()?.files_count);
  copiesCount = computed(() => this.estimated()?.copies_count);

  loading = false;

  cleanUp() {
    this.loading = true;
    this.cleanUpS
      .cleanup()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.update$.next();
      });
  }
}
