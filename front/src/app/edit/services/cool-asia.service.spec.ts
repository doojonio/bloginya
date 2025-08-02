import { TestBed } from '@angular/core/testing';

import { CoolAsiaService } from './cool-asia.service';

describe('CoolAsiaService', () => {
  let service: CoolAsiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolAsiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
