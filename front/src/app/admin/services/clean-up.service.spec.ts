import { TestBed } from '@angular/core/testing';

import { CleanUpService } from './clean-up.service';

describe('CleanUpService', () => {
  let service: CleanUpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CleanUpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
