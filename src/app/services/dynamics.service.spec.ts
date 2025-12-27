import { TestBed } from '@angular/core/testing';

import { DynamicsService } from './dynamics.service';

describe('DynamicsService', () => {
  let service: DynamicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
