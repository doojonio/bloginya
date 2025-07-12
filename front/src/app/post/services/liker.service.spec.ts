import { TestBed } from '@angular/core/testing';

import { LikerService } from './liker.service';

describe('LikerService', () => {
  let service: LikerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LikerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
