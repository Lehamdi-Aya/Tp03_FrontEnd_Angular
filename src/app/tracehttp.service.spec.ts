import { TestBed } from '@angular/core/testing';

import { TracehttpService } from './tracehttp.service';

describe('TracehttpService', () => {
  let service: TracehttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TracehttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
