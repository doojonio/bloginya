import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuAsianHelpersComponent } from './menu-asian-helpers.component';

describe('MenuAsianHelpersComponent', () => {
  let component: MenuAsianHelpersComponent;
  let fixture: ComponentFixture<MenuAsianHelpersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuAsianHelpersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuAsianHelpersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
