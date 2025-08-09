import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maybeShortname',
})
export class MaybeShortnamePipe implements PipeTransform {
  transform(
    value: { name?: string | null; id: string; shortname?: string | null },
    ...args: string[]
  ): string {
    const sn = value.shortname || value.name;

    if (sn) {
      return '/' + sn;
    } else {
      return '/' + args.join('/') + '/' + value.id;
    }
  }
}
