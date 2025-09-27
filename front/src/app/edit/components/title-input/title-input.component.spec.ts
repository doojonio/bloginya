import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleInputComponent } from './title-input.component';

describe('TitleInputComponent', () => {
  let component: TitleInputComponent;
  let fixture: ComponentFixture<TitleInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TitleInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
