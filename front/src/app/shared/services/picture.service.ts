import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PictureService {
  picStyle(driveId: string | null, varName: VARIANT) {
    if (driveId == null) {
      return 'rgb(117, 85, 112)';
    }

    return 'url(' + variant(driveId, varName) + ') center / cover no-repeat';
  }
}

export function picStyle(driveId: string | null, varName: VARIANT) {
  if (driveId == null) {
    return 'rgb(117, 85, 112)';
  }

  return 'url(' + variant(driveId, varName) + ') center / cover no-repeat';
}
export type VARIANT =
  | 'thumbnail'
  | 'pre140'
  | 'pre280'
  | 'pre450'
  | 'medium'
  | 'large'
  | 'original';

export function variant(driveId: string | null, variant: VARIANT) {
  if (driveId == null || driveId == '') {
    return null;
  }
  return driveId + '?d=' + variant;
}
