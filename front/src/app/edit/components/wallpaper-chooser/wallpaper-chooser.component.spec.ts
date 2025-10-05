import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WallpaperChooserComponent } from './wallpaper-chooser.component';

describe('WallpaperChooserComponent', () => {
  let component: WallpaperChooserComponent;
  let fixture: ComponentFixture<WallpaperChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WallpaperChooserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WallpaperChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
