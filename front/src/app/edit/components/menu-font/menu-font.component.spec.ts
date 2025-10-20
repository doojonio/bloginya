import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuFontComponent } from './menu-font.component';

describe('MenuFontComponent', () => {
  let component: MenuFontComponent;
  let fixture: ComponentFixture<MenuFontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuFontComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuFontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
