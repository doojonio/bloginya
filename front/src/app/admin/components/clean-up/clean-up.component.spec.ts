import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CleanUpComponent } from './clean-up.component';

describe('CleanUpComponent', () => {
  let component: CleanUpComponent;
  let fixture: ComponentFixture<CleanUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CleanUpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CleanUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
