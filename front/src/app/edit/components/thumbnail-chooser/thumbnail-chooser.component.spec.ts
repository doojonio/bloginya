import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailChooserComponent } from './thumbnail-chooser.component';

describe('ThumbnailChooserComponent', () => {
  let component: ThumbnailChooserComponent;
  let fixture: ComponentFixture<ThumbnailChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThumbnailChooserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThumbnailChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
