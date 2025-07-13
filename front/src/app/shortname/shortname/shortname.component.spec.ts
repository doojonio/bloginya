import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortnameComponent } from './shortname.component';

describe('AnyViewComponent', () => {
  let component: ShortnameComponent;
  let fixture: ComponentFixture<ShortnameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShortnameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShortnameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
