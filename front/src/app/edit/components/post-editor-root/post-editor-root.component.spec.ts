import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditorRootComponent } from './post-editor-root.component';

describe('PostEditorRootComponent', () => {
  let component: PostEditorRootComponent;
  let fixture: ComponentFixture<PostEditorRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostEditorRootComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostEditorRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
