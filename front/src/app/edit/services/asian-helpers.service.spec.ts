import { TestBed } from '@angular/core/testing';

import { AsianHelpersService } from './asian-helpers.service';

describe('AsianHelpersService', () => {
  let service: AsianHelpersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsianHelpersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
