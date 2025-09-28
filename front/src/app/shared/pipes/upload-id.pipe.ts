import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uploadId',
})
export class UploadIdPipe implements PipeTransform {
  transform(value: string | undefined | null, ...args: unknown[]) {
    return value ? value.split('?')[0] : '';
  }
}
