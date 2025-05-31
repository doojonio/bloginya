import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandsetComponent } from './handset.component';

describe('HandsetComponent', () => {
  let component: HandsetComponent;
  let fixture: ComponentFixture<HandsetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HandsetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
