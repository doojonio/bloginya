import { TestBed } from '@angular/core/testing';

import { NewDraftService } from './new-draft.service';

describe('NewDraftService', () => {
  let service: NewDraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewDraftService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
