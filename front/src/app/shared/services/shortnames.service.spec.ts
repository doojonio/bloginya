import { TestBed } from '@angular/core/testing';
import { ShortnamesService } from './shortnames.service';


describe('ShortnamesService', () => {
  let service: ShortnamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShortnamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
