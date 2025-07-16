import { TestBed } from '@angular/core/testing';

import { ProfileReaderService } from './profile-reader.service';

describe('ProfileReaderService', () => {
  let service: ProfileReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
