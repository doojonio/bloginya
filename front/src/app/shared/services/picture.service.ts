import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  picStyle(driveId: string | null, varName: VARIANT) {
    if (driveId == null) {
      return 'rgb(117, 85, 112)';
    }

    return (
      'url(' + this.variant(driveId, varName) + ') center / cover no-repeat'
    );
  }
  variant(driveId: string | null, variant: VARIANT) {
    if (driveId == null || driveId == '') {
      return null;
    }
    return driveId + '?d=' + variant;
  }
}

export type VARIANT =
  | 'thumbnail'
  | 'pre140'
  | 'pre280'
  | 'pre450'
  | 'pre450_95'
  | 'medium'
  | 'large'
  | 'original';

export const BreakpointMap: { [key: number]: VARIANT } = {
  40: 'thumbnail',
  140: 'pre140',
  280: 'pre280',
  450: 'pre450',
  880: 'medium',
  1600: 'large',
  2560: 'original',
};
