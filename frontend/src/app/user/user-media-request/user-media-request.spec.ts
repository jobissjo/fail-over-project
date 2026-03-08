import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMediaRequest } from './user-media-request';

describe('UserMediaRequest', () => {
  let component: UserMediaRequest;
  let fixture: ComponentFixture<UserMediaRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMediaRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMediaRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
