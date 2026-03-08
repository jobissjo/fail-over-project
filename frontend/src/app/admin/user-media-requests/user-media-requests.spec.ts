import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMediaRequests } from './user-media-requests';

describe('UserMediaRequests', () => {
  let component: UserMediaRequests;
  let fixture: ComponentFixture<UserMediaRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMediaRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMediaRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
