import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaEditorComponent } from './meta-editor.component';

describe('MetaEditorComponent', () => {
  let component: MetaEditorComponent;
  let fixture: ComponentFixture<MetaEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetaEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
