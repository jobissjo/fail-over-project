import { TestBed } from '@angular/core/testing';

import { MediaRequest } from './media-request';

describe('MediaRequest', () => {
  let service: MediaRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaRequest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
