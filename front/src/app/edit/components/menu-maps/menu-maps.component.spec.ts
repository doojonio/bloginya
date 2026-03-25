import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuMapsComponent } from './menu-maps.component';

describe('MenuMapsComponent', () => {
  let component: MenuMapsComponent;
  let fixture: ComponentFixture<MenuMapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuMapsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuMapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
