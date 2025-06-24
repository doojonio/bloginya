import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostListOnelineComponent } from './post-list-oneline.component';

describe('NewPostsComponent', () => {
  let component: PostListOnelineComponent;
  let fixture: ComponentFixture<PostListOnelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostListOnelineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostListOnelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
