import { MaybeShortnamePipe } from './maybe-shortname.pipe';

describe('MaybeShortnamePipe', () => {
  it('create an instance', () => {
    const pipe = new MaybeShortnamePipe();
    expect(pipe).toBeTruthy();
  });
});
