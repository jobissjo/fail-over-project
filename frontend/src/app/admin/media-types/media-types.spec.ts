import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaTypes } from './media-types';

describe('MediaTypes', () => {
  let component: MediaTypes;
  let fixture: ComponentFixture<MediaTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
