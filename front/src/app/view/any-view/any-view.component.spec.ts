import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnyViewComponent } from './any-view.component';

describe('AnyViewComponent', () => {
  let component: AnyViewComponent;
  let fixture: ComponentFixture<AnyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnyViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
