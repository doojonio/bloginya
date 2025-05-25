import { TestBed } from '@angular/core/testing';

import { CdataService } from './cdata.service';

describe('CdataService', () => {
  let service: CdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
