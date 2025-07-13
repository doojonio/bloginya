import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceErrors } from '../interfaces/service-errors.interface';

@Injectable({
  providedIn: 'root',
})
export class NotifierService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly CONFIG = { duration: 5000 };

  notify(msg: string, act = 'Close') {
    this.snackBar.open(msg, act, this.CONFIG);
  }

  mapError(error: HttpErrorResponse) {
    const message = error.error?.message;
    if (message == 'NOCAT') {
      return ServiceErrors.NOCAT;
    } else if (message == 'NORIGHT') {
      return ServiceErrors.NORIGHT;
    }
    return ServiceErrors.UNDEF;
  }

  notifyError(httpErr: HttpErrorResponse) {
    const err = this.mapError(httpErr);
    // TODO: global config or service?
    if (err == ServiceErrors.UNDEF) {
      this.snackBar.open('Unknown error', 'Close', this.CONFIG);
    } else if (err == ServiceErrors.NORIGHT) {
      this.snackBar.open('Forbidden', 'Close', this.CONFIG);
    } else if (err == ServiceErrors.NOCAT) {
      this.snackBar.open('Missing category', 'Close', this.CONFIG);
    }

    return err;
  }
}
