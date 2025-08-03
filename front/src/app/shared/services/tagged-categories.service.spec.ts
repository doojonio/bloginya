import { TestBed } from '@angular/core/testing';

import { TaggedCategoriesService } from './tagged-categories.service';

describe('TaggedCategoriesService', () => {
  let service: TaggedCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaggedCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
