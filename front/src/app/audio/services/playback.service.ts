import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService {
  private pause$ = new Subject<void>();

  onPause() {
    return this.pause$.asObservable();
  }

  pauseAll() {
    this.pause$.next();
  }

}
